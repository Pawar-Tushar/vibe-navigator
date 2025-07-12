

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in .env.local");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export interface ChatTurn {
  role: "user" | "model";
  parts: string;
}

export interface AgentApiResponse {
  reply: string;
  sources: {
    location_name: string;
    review_text: string;
    author: string | null;
  }[];
}

export const chatWithAgent = async (
  query: string,
  city: string,
  chatHistory: ChatTurn[]
): Promise<AgentApiResponse> => {
  try {
    const response = await api.post<AgentApiResponse>("/vibes/agent/chat", {
      query,
      city,
      chat_history: chatHistory,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 422) {
      console.error("Validation Error:", error.response.data);
      throw new Error("There was a problem with the request data.");
    }
    throw new Error(error.message || "API Error");
  }
};
export const generateVibeTour = async (
  city: string,
  vibeTags: string[]
) => {
  try {
    const response = await api.post("/vibes/agent/tour", {
      city,
      vibe_tags: vibeTags,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
export const fetchLocations = async (city: string, category: string) => {
  try {
    const response = await api.get("/vibes/locations", {
      params: { city, category },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};