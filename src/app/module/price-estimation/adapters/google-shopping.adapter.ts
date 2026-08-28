import {
  IPriceSource,
} from "../price-estimation.interface";


interface GoogleShoppingResult {
  title?: string;
  price?: string;
  extracted_price?: number;
  product_link?: string;
  source?: string;
}


export const searchGoogleShopping =
  async (
    searchQuery: string
  ): Promise<IPriceSource[]> => {

    const apiKey =
      process.env.SERPAPI_KEY;

    if (!apiKey) {
      throw new Error(
        "SERPAPI_KEY is not configured"
      );
    }


    try {

      const url =
        new URL(
          "https://serpapi.com/search.json"
        );


      url.searchParams.set(
        "engine",
        "google_shopping"
      );

      url.searchParams.set(
        "q",
        searchQuery
      );

      url.searchParams.set(
        "location",
        "Ahmedabad, Gujarat, India"
      );

      url.searchParams.set(
        "gl",
        "in"
      );

      url.searchParams.set(
        "hl",
        "en"
      );

      url.searchParams.set(
        "api_key",
        apiKey
      );


      const response =
        await fetch(
          url.toString()
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        console.error(
          "SerpAPI HTTP error:",
          errorText
        );

        return [];
      }


      const data =
        await response.json() as {
          shopping_results?: GoogleShoppingResult[];
          error?: string;
        };


      if (data.error) {

        console.error(
          "SerpAPI error:",
          data.error
        );

        return [];
      }


      if (
        !data.shopping_results ||
        data.shopping_results.length === 0
      ) {

        console.log(
          "No Google Shopping results found"
        );

        return [];
      }


      const results:
        (IPriceSource | null)[] =
        data.shopping_results.map(
          (
            item: GoogleShoppingResult
          ): IPriceSource | null => {

            const price =
              Number(
                item.extracted_price
              );


            if (
              !Number.isFinite(price) ||
              price <= 0
            ) {
              return null;
            }


            return {
              sourceName:
                item.source ||
                "Google Shopping",

              productName:
                item.title,

              price,

              sourceUrl:
                item.product_link,
            };
          }
        );


      return results.filter(
        (
          item: IPriceSource | null
        ): item is IPriceSource =>
          item !== null
      );


    } catch (error) {

      console.error(
        "Google Shopping adapter error:",
        error
      );

      return [];
    }
  };