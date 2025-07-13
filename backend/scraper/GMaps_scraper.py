import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re

TARGET_CITIES = {
    "pune": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places", "restaurants"]},
    "mumbai": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places", "beach"]},
    "bangalore": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places"]},
    "delhi": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places"]},
    "noida": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places"]},
    "goa": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places", "beach"]},
}

LOCATIONS_PER_CATEGORY = 5
REVIEWS_PER_LOCATION = 15
OUTPUT_FILE = "data.json"

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080") 
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
    prefs = {"intl.accept_languages": "en,en_US"}
    options.add_experimental_option("prefs", prefs)
    
    service = Service()
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def handle_cookie_banner(driver):
    try:
        cookie_button_xpath = "//form[contains(@action, 'consent')]//button"
        cookie_buttons = WebDriverWait(driver, 5).until(EC.presence_of_all_elements_located((By.XPATH, cookie_button_xpath)))
        
        reject_button = next((b for b in cookie_buttons if "Reject" in b.text), None)
        if reject_button:
            reject_button.click()
            print("  - Handled cookie banner (Clicked Reject).")
        else:
            cookie_buttons[0].click() 
            print("  - Handled cookie banner.")
        time.sleep(1)
    except Exception:
        print("  - No cookie banner found, or could not handle it. Continuing...")


def scrape_google_maps_reviews(driver):
    reviews_data = []
    
    try:
        reviews_button_xpath = "//button[contains(@aria-label, 'Reviews for') or .//span[text()='Reviews'] or contains(@aria-label, 'More reviews')]"
        review_button = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, reviews_button_xpath)))
        
        driver.execute_script("arguments[0].click();", review_button)
        print("  - Clicked 'Reviews' tab using JavaScript.")
        time.sleep(2) 

    except Exception as e:
        print(f"  - Could not find or click review button. Skipping reviews. Error: {e}")
        return []

    try:
        scrollable_div_xpath = "//div[contains(@class, 'm6QErb') and @role='main']"
        scrollable_div = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, scrollable_div_xpath)))
        
        print("  - Scrolling to load reviews...")
        for _ in range(10):
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight;", scrollable_div)
            time.sleep(2)
        
        review_elements = driver.find_elements(By.XPATH, "//div[@data-review-id]")

        print(f"  - Found {len(review_elements)} review containers. Parsing...")
        
        for el in review_elements[:REVIEWS_PER_LOCATION]:
            try:
                author = el.find_element(By.CSS_SELECTOR, ".d4r55").text.strip()
                review_text = el.find_element(By.CSS_SELECTOR, ".wiI7pd").text.strip()
                
                if review_text:
                    reviews_data.append({
                        "text": review_text,
                        "source": "Google Maps",
                        "author": author
                    })
            except Exception:
                continue
    
    except Exception as e:
        print(f"  - An error occurred during review scraping: {e}")

    return reviews_data

def scrape_google_maps(driver, query):
    print(f"\nScraping Google Maps for: '{query}'")
    locations = []
    search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}?hl=en"
    driver.get(search_url)

    handle_cookie_banner(driver)

    try:
        result_panel_xpath = "//div[contains(@aria-label, 'Results for')]"
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, result_panel_xpath)))
        
        result_links = driver.find_elements(By.XPATH, f"{result_panel_xpath}//a[contains(@href, 'google.com/maps/place/')]")
        location_urls = [link.get_attribute('href') for link in result_links if link.get_attribute('href')]
        unique_urls = list(dict.fromkeys(location_urls)) 

        print(f"  Found {len(unique_urls)} potential locations. Processing top {LOCATIONS_PER_CATEGORY}...")

        for url in unique_urls[:LOCATIONS_PER_CATEGORY]:
            try:
                driver.get(url)
                name = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, "//h1"))).text
                address_xpath = "//button[@data-item-id='address']//div[contains(@class, 'fontBodyMedium')]"
                address = WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.XPATH, address_xpath))).text.strip()
                
                lat, lon = 0.0, 0.0
                match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', driver.current_url)
                if match: lat, lon = float(match.group(1)), float(match.group(2))

                print(f"\n  > Processing: {name}")
                print(f"    Address: {address}")

                gmaps_reviews = scrape_google_maps_reviews(driver)
                print(f"    Scraped {len(gmaps_reviews)} reviews.")

                if gmaps_reviews:
                    locations.append({"name": name, "address": address, "coordinates": {"lat": lat, "lon": lon}, "raw_reviews": gmaps_reviews})
                else:
                    print("    Skipping location due to no reviews found.")
                
            except Exception as e:
                print(f"    Could not process location {url}. Error: {e}")
                continue
    except Exception as e:
        print(f"An error occurred during search for '{query}': {e}")
        
    return locations

if __name__ == "__main__":
    master_list = []
    driver = get_driver()
    try:
        for city, data in TARGET_CITIES.items():
            for category in data['categories']:
                query = f"{category} in {city}"
                scraped_locations = scrape_google_maps(driver, query)
                for loc in scraped_locations:
                    loc['city'], loc['category'] = city, category
                master_list.extend(scraped_locations)
                print(f"--- Finished scraping for '{query}' ---")
    finally:
        driver.quit()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(master_list, f, indent=4, ensure_ascii=False)
    print(f"\n All done! Scraped {len(master_list)} locations and saved to {OUTPUT_FILE}")