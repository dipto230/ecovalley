import status from "http-status";

import {
  Prisma,
  ProductCondition,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

import {
  IPriceEstimationResult,
  IPriceSource,
} from "./price-estimation.interface";
import { searchGoogleShopping } from "./adapters/google-shopping.adapter";
import { MarketComparisonService } from "../market-comparison/market-comparison.service";
import { GoogleGenAI } from "@google/genai";





const searchAmazon = async (
  searchQuery: string
): Promise<IPriceSource[]> => {

  console.log(
    `Amazon search query: ${searchQuery}`
  );

  // TODO:
  // Add permitted Amazon API/data provider here.

  return [];
};


const searchFlipkart = async (
  searchQuery: string
): Promise<IPriceSource[]> => {

  console.log(
    `Flipkart search query: ${searchQuery}`
  );

  // TODO:
  // Add permitted Flipkart API/data provider here.

  return [];
};


const searchEbay = async (
  searchQuery: string
): Promise<IPriceSource[]> => {

  console.log(
    `eBay search query: ${searchQuery}`
  );

  // TODO:
  // Add permitted eBay API/data provider here.

  return [];
};




const buildSearchQuery = (product: {
  title: string;
  brand: string | null;
  model: string | null;
  condition: string;
}) => {

  const parts = [
    product.brand,
    product.model,
    product.title,
    product.condition,
  ].filter(Boolean);

  return parts.join(" ");
};





const cleanPrices = (sources: IPriceSource[]) => {
  return sources.filter(
    (source) =>
      Number.isFinite(source.price) &&
      source.price > 0 &&
      source.price <= 99_999_999.99
  );
};





const calculateStatistics = (
  sources: IPriceSource[]
) => {

  const prices = sources.map(
    (source) => source.price
  );

  if (prices.length === 0) {

    throw new AppError(
      status.NOT_FOUND,
      "No online prices found"
    );
  }


  const lowestPrice = Math.min(
    ...prices
  );

  const highestPrice = Math.max(
    ...prices
  );


  const averagePrice =
    prices.reduce(
      (sum, price) =>
        sum + price,
      0
    ) / prices.length;


  return {
    lowestPrice,
    highestPrice,
    averagePrice,
  };
};




const calculateConfidence = (
  sourceCount: number
) => {

  if (sourceCount >= 10) {
    return 95;
  }

  if (sourceCount >= 7) {
    return 90;
  }

  if (sourceCount >= 5) {
    return 85;
  }

  if (sourceCount >= 3) {
    return 75;
  }

  if (sourceCount >= 1) {
    return 50;
  }

  return 0;
};





const calculateAiPredictedPrice = (
  averagePrice: number,
  lowestPrice: number,
  highestPrice: number
) => {

  

  const predictedPrice =
    averagePrice * 0.6 +
    lowestPrice * 0.2 +
    highestPrice * 0.2;


  return Number(
    predictedPrice.toFixed(2)
  );
};




const estimateProductPrice = async (
  productId: string
): Promise<IPriceEstimationResult> => {

 

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },

      include: {
        category: true,
      },
    });


  if (!product) {

    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }


  

  const searchQuery =
    buildSearchQuery({
      title: product.title,
      brand: product.brand,
      model: product.model,
      condition: product.condition,
    });


  

  const [
    amazonPrices,
    flipkartPrices,
      ebayPrices,
     googleShoppingPrices,
  ] = await Promise.all([

    searchAmazon(
      searchQuery
    ),

    searchFlipkart(
      searchQuery
    ),

    searchEbay(
      searchQuery
      ),
    searchGoogleShopping(
    searchQuery
  ),

  ]);


  

  const allSources = [
    ...amazonPrices,
    ...flipkartPrices,
      ...ebayPrices,
    ...googleShoppingPrices,
  ];


  

  const validSources =
    cleanPrices(
      allSources
    );
  
  await MarketComparisonService
  .createManyMarketComparisons(
    productId,
    validSources
  );


  

  const {
    lowestPrice,
    highestPrice,
    averagePrice,
  } =
    calculateStatistics(
      validSources
    );


 

  const aiPredictedPrice =
    calculateAiPredictedPrice(
      averagePrice,
      lowestPrice,
      highestPrice
    );


  

  const confidenceScore =
    calculateConfidence(
      validSources.length
    );


  

  await prisma.priceEstimation.create({
    data: {

      productId,

      aiPredictedPrice:
        new Prisma.Decimal(
          aiPredictedPrice
        ),

      averagePrice:
        new Prisma.Decimal(
          averagePrice
        ),

      lowestPrice:
        new Prisma.Decimal(
          lowestPrice
        ),

      highestPrice:
        new Prisma.Decimal(
          highestPrice
        ),

      confidenceScore,

      sources: {
        create:
          validSources.map(
            (source) => ({
              sourceName:
                source.sourceName,

              productName:
                source.productName,

              price:
                new Prisma.Decimal(
                  source.price
                ),

              sourceUrl:
                source.sourceUrl,
            })
          ),
      },

    },
  });




  await prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      estimatedPrice:
        new Prisma.Decimal(
          aiPredictedPrice
        ),
    },
  });


 

  return {
    aiPredictedPrice,
    averagePrice,
    lowestPrice,
    highestPrice,
    confidenceScore,
    sources: validSources,
  };
};



const aiModel = "gemini-2.5-flash";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const estimateImagePrice = async (imageUrl: string) => {
  if (!imageUrl) {
    throw new AppError(
      status.BAD_REQUEST,
      "Image URL is required"
    );
  }

  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new AppError(
      status.BAD_GATEWAY,
      "Unable to load uploaded image"
    );
  }

  const mimeType =
    imageResponse.headers.get("content-type") || "image/jpeg";

  if (!mimeType.startsWith("image/")) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid image URL"
    );
  }

  const buffer = Buffer.from(
    await imageResponse.arrayBuffer()
  );

  const response = await genAI.models.generateContent({
    model: aiModel,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: buffer.toString("base64"),
            },
          },
          {
            text: `
Identify the electronic product in this image.
Return ONLY valid JSON:
{
  "detectedCategory": "string or null",
  "detectedBrand": "string or null",
  "detectedModel": "string or null",
  "condition": "NEW, USED, REFURBISHED, or null",
  "confidenceScore": 0
}
Never invent a brand or model.
`,
          },
        ],
      },
    ],
  });

  const text = response.text;

  if (!text) {
    throw new AppError(
      status.BAD_GATEWAY,
      "AI returned an empty response"
    );
  }

  let detected: {
    detectedCategory?: string | null;
    detectedBrand?: string | null;
    detectedModel?: string | null;
    condition?: string | null;
    confidenceScore?: number;
  };

  try {
    detected = JSON.parse(
      text.replace(/```json/g, "").replace(/```/g, "").trim()
    );
  } catch {
    throw new AppError(
      status.BAD_GATEWAY,
      "Invalid AI response"
    );
  }

  const rawCondition = detected.condition?.toUpperCase();

  const condition =
    rawCondition === "NEW" ||
    rawCondition === "USED" ||
    rawCondition === "REFURBISHED"
      ? (rawCondition as ProductCondition)
      : null;

  const searchQuery = [
    detected.detectedBrand,
    detected.detectedModel,
    detected.detectedCategory,
    condition,
  ]
    .filter(Boolean)
    .join(" ");

  if (!searchQuery) {
    throw new AppError(
      status.UNPROCESSABLE_ENTITY,
      "Could not identify the product"
    );
  }

  const googlePrices = await searchGoogleShopping(searchQuery);
  const validSources = cleanPrices(googlePrices);

  if (validSources.length === 0) {
    throw new AppError(
      status.NOT_FOUND,
      "No online prices found for this product"
    );
  }

  const {
    lowestPrice,
    highestPrice,
    averagePrice,
  } = calculateStatistics(validSources);

  const aiPredictedPrice = calculateAiPredictedPrice(
    averagePrice,
    lowestPrice,
    highestPrice
  );

  const confidenceScore = calculateConfidence(
    validSources.length
  );

  const detectionConfidence = Math.max(
    0,
    Math.min(100, Number(detected.confidenceScore) || 0)
  );

  const savedEstimate =
    await prisma.imagePriceEstimate.create({
      data: {
        imageUrl,
        detectedCategory: detected.detectedCategory ?? null,
        detectedBrand: detected.detectedBrand ?? null,
        detectedModel: detected.detectedModel ?? null,
        condition,
        detectionConfidence,
        aiModel,
        aiPredictedPrice: new Prisma.Decimal(aiPredictedPrice),
        averagePrice: new Prisma.Decimal(averagePrice),
        lowestPrice: new Prisma.Decimal(lowestPrice),
        highestPrice: new Prisma.Decimal(highestPrice),
        confidenceScore,
        sources: {
          create: validSources.map((source) => ({
            sourceName: source.sourceName,
            productName: source.productName,
            price: new Prisma.Decimal(source.price),
            sourceUrl: source.sourceUrl,
          })),
        },
      },
      include: {
        sources: true,
      },
    });

  return savedEstimate;
};



export const PriceEstimationService = {
  estimateProductPrice,
  estimateImagePrice,
};