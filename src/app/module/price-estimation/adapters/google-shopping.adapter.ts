import axios from "axios";

import { IPriceSource } from "../price-estimation.interface";

interface GoogleShoppingResult {
  title?: string;
  price?: string;
  extracted_price?: number;
  product_link?: string;
  source?: string;
}

interface SerpApiResponse {
  shopping_results?: GoogleShoppingResult[];
  error?: string;
}

export const searchGoogleShopping = async (
  searchQuery: string
): Promise<IPriceSource[]> => {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.error("❌ SERPAPI_KEY is not configured");
    return [];
  }

  try {
    console.log(
      `🔎 Searching Google Shopping for: ${searchQuery}`
    );

    const response = await axios.get<SerpApiResponse>(
      "https://serpapi.com/search.json",
      {
        params: {
          engine: "google_shopping",
          q: searchQuery,
          location: "Ahmedabad, Gujarat, India",
          gl: "in",
          hl: "en",
          api_key: apiKey,
        },
        timeout: 30000,
      }
    );

    const data = response.data;

   
    if (data.error) {
      console.error(
        "❌ SerpAPI error:",
        data.error
      );

      return [];
    }

  
    if (
      !data.shopping_results ||
      data.shopping_results.length === 0
    ) {
      console.log(
        "⚠️ No Google Shopping results found"
      );

      return [];
    }

    console.log(
      `✅ Google Shopping returned ${data.shopping_results.length} results`
    );

    const results: IPriceSource[] = [];

    for (const item of data.shopping_results) {
      const price = Number(item.extracted_price);

     
      if (!Number.isFinite(price) || price <= 0) {
        continue;
      }

      results.push({
        sourceName:
          item.source || "Google Shopping",

        productName:
          item.title || searchQuery,

        price,

        sourceUrl:
          item.product_link,
      });
    }

    console.log(
      `💰 Valid Google Shopping prices: ${results.length}`
    );

    console.log(
      "💰 Price results:",
      results
    );

    return results;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Google Shopping Axios Error:",
        error.message
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "Code:",
        error.code
      );
    } else {
      console.error(
        "❌ Google Shopping Error:",
        error
      );
    }

    return [];
  }
};