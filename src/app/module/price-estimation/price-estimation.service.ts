import status from "http-status";

import {
  Prisma,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

import {
  IPriceEstimationResult,
  IPriceSource,
} from "./price-estimation.interface";
import { searchGoogleShopping } from "./adapters/google-shopping.adapter";
import { MarketComparisonService } from "../market-comparison/market-comparison.service";





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




const cleanPrices = (
  sources: IPriceSource[]
) => {

  return sources.filter(
    (source) =>
      Number.isFinite(source.price) &&
      source.price > 0
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


export const PriceEstimationService = {
  estimateProductPrice,
};