import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from fastapi import BackgroundTasks
from typing import List

from db.mongo import get_location_collection
from .ai_analyzer import analyze_locations

def get_scraper_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
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

async def scrape_and_populate_db(
    query: str, 
    city: str, 
    category: str, 
    background_tasks: BackgroundTasks 
):
    
    print(f"BACKGROUND TASK (1/3): Starting on-demand scrape for '{query}'...")
    driver = get_scraper_driver()
    
    new_location_ids: List = []

    try:
        search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}?hl=en"
        driver.get(search_url)

        try:
            cookie_button_xpath = "//form[contains(@action, 'consent')]//button"
            cookie_buttons = WebDriverWait(driver, 5).until(EC.presence_of_all_elements_located((By.XPATH, cookie_button_xpath)))
            reject_button = next((b for b in cookie_buttons if "Reject" in b.text), None)
            if reject_button: reject_button.click()
            else: cookie_buttons[0].click()
        except Exception:
            pass

        result_panel_xpath = "//div[contains(@aria-label, 'Results for')]"
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, result_panel_xpath)))
        result_links = driver.find_elements(By.XPATH, f"{result_panel_xpath}//a[contains(@href, 'google.com/maps/place/')]")
        unique_urls = list(dict.fromkeys([link.get_attribute('href') for link in result_links if link.get_attribute('href')]))
        print(f"  > Found {len(unique_urls)} potential new locations.")

        for url in unique_urls[:2]: 
            try:
                driver.get(url)
                name = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, "//h1"))).text
                print(f"\n    >> Processing URL for: {name}")
                
                reviews_data = []
                try:
                    reviews_button_xpath = "//button[contains(@aria-label, 'Reviews for') or .//span[text()='Reviews']]"
                    review_button = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, reviews_button_xpath)))
                    driver.execute_script("arguments[0].click();", review_button)
                    time.sleep(2)
                    scrollable_div_xpath = "//div[contains(@class, 'm6QErb') and @role='main']"
                    scrollable_div = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, scrollable_div_xpath)))
                    for _ in range(5):
                        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight;", scrollable_div)
                        time.sleep(1.5)
                    review_elements = driver.find_elements(By.XPATH, "//div[@data-review-id]")
                    for el in review_elements[:15]:
                        try:
                            author = el.find_element(By.CSS_SELECTOR, ".d4r55").text.strip()
                            review_text = el.find_element(By.CSS_SELECTOR, ".wiI7pd").text.strip()
                            if review_text: reviews_data.append({"text": review_text, "source": "Google Maps", "author": author})
                        except Exception: continue
                except Exception:
                    pass

                if not reviews_data:
                    print(f"    >> SKIPPING {name} due to zero reviews found.")
                    continue

                print(f"    >> Successfully scraped {len(reviews_data)} reviews for {name}. Preparing to save.")
              
                try:
                    address_xpath = "//button[@data-item-id='address']//div[contains(@class, 'fontBodyMedium')]"
                    address_element = WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.XPATH, address_xpath)))
                    address = address_element.text.strip()
                    print("      - Found address using simplified selector.")
                except Exception as e:
                    print(f"      - Failed to fetch address. Saving as 'N/A'. Error: {e}")
                    address = "N/A"

                lat, lon = 0.0, 0.0
                match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', driver.current_url)
                if match: lat, lon = float(match.group(1)), float(match.group(2))


                location_doc = {
                    "name": name, "city": city.lower(), "category": category.lower(),
                    "address": address, "coordinates": {"lat": lat, "lon": lon},
                    "raw_reviews": reviews_data,
                    "processing_status": "new" 
                }
                
                location_collection = await get_location_collection()
                
                db_result = await location_collection.update_one(
                    {'name': name, 'city': city.lower()}, 
                    {'$set': location_doc}, 
                    upsert=True
                )
                
                if db_result.upserted_id:
                    new_location_ids.append(db_result.upserted_id)

                print(f"     > Upserted '{name}' into the database.")

            except Exception as e:
                print(f"     An error occurred processing a single URL. Error: {e}")
                continue
    finally:
        driver.quit()
    if new_location_ids:
        print(f"\nScrape task complete. Triggering AI analysis for {len(new_location_ids)} new locations.")
        background_tasks.add_task(analyze_locations, new_location_ids, background_tasks)
    else:
        print("\nScrape task complete. No new locations were added to the database.")