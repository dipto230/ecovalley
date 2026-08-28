import status from "http-status";

import {
  Prisma,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";

import {
  IQueryParams,
} from "../../interfaces/query.interface";

import { prisma } from "../../lib/prisma";

import {
  QueryBuilder,
} from "../../utils/QueryBuilder";

import {
  ICreateMarketComparison,
} from "./market-comparison.interface";

import {
  marketComparisonFilterableFields,
  marketComparisonSearchableFields,
} from "./market-comparison.constant";




type MarketComparisonRecord = {
  id: string;
  productId: string;
  platformName: string;
  productUrl: string;
  marketPrice: Prisma.Decimal;
  createdAt: Date;
};




const createMarketComparison = async (
  payload: ICreateMarketComparison
) => {

  const {
    productId,
    platformName,
    productUrl,
    marketPrice,
  } = payload;


  

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });


  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }


  

  if (
    !platformName ||
    !platformName.trim()
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Platform name is required"
    );
  }


  

  if (
    !productUrl ||
    !productUrl.trim()
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Product URL is required"
    );
  }




  if (
    !Number.isFinite(marketPrice) ||
    marketPrice <= 0
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid market price"
    );
  }


  

  const comparison =
    await prisma.marketComparison.create({
      data: {
        productId,

        platformName:
          platformName.trim(),

        productUrl:
          productUrl.trim(),

        marketPrice:
          new Prisma.Decimal(
            marketPrice
          ),
      },
    });


  return comparison;
};




const createManyMarketComparisons = async (
  productId: string,
  sources: {
    sourceName: string;
    price: number;
    sourceUrl?: string;
  }[]
) => {



  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
      },
    });


  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }


 

  if (
    !Array.isArray(sources) ||
    sources.length === 0
  ) {
    return [];
  }


  

  const validSources =
    sources.filter(
      (source) =>
        source.sourceName?.trim() &&
        source.sourceUrl?.trim() &&
        Number.isFinite(source.price) &&
        source.price > 0
    );


  if (
    validSources.length === 0
  ) {
    return [];
  }




  await prisma.marketComparison.createMany({
    data: validSources.map(
      (source) => ({
        productId,

        platformName:
          source.sourceName.trim(),

        productUrl:
          source.sourceUrl!.trim(),

        marketPrice:
          new Prisma.Decimal(
            source.price
          ),
      })
    ),
  });


  

  return prisma.marketComparison.findMany({
    where: {
      productId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};




const getAllMarketComparisons = async (
  query: IQueryParams
) => {

  const queryBuilder =
    new QueryBuilder<
      MarketComparisonRecord,
      Prisma.MarketComparisonWhereInput,
      Prisma.MarketComparisonInclude
    >(
      prisma.marketComparison,
      query,
      {
        searchableFields:
          marketComparisonSearchableFields,

        filterableFields:
          marketComparisonFilterableFields,
      }
    );


  const result =
    await queryBuilder

      .search()

      .filter()

      .paginate()

      .sort()

      .fields()

      .execute();


  return result;
};




const getMarketComparisonsByProduct =
  async (
    productId: string,
    query: IQueryParams
  ) => {

    

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        select: {
          id: true,
        },
      });


    if (!product) {
      throw new AppError(
        status.NOT_FOUND,
        "Product not found"
      );
    }


  

    const queryBuilder =
      new QueryBuilder<
        MarketComparisonRecord,
        Prisma.MarketComparisonWhereInput,
        Prisma.MarketComparisonInclude
      >(
        prisma.marketComparison,
        query,
        {
          searchableFields:
            marketComparisonSearchableFields,

          filterableFields:
            marketComparisonFilterableFields,
        }
      );


    const result =
      await queryBuilder

        .search()

        .filter()

        .where({
          productId,
        })

        .paginate()

        .sort()

        .fields()

        .execute();


   

    const statistics =
      await prisma.marketComparison.aggregate({
        where: {
          productId,
        },

        _avg: {
          marketPrice: true,
        },

        _min: {
          marketPrice: true,
        },

        _max: {
          marketPrice: true,
        },

        _count: {
          id: true,
        },
      });


 

    return {
      data: result.data,

      meta: result.meta,

      statistics: {
        averagePrice:
          Number(
            statistics._avg.marketPrice ?? 0
          ),

        lowestPrice:
          Number(
            statistics._min.marketPrice ?? 0
          ),

        highestPrice:
          Number(
            statistics._max.marketPrice ?? 0
          ),

        totalSources:
          statistics._count.id,
      },
    };
  };




const getSingleMarketComparison =
  async (
    id: string
  ) => {

    const comparison =
      await prisma.marketComparison.findUnique({
        where: {
          id,
        },

        include: {
          product: {
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              condition: true,
            },
          },
        },
      });


    if (!comparison) {
      throw new AppError(
        status.NOT_FOUND,
        "Market comparison not found"
      );
    }


    return comparison;
  };




const deleteMarketComparison =
  async (
    id: string
  ) => {

    const comparison =
      await prisma.marketComparison.findUnique({
        where: {
          id,
        },
      });


    if (!comparison) {
      throw new AppError(
        status.NOT_FOUND,
        "Market comparison not found"
      );
    }


    await prisma.marketComparison.delete({
      where: {
        id,
      },
    });


    return null;
  };




export const MarketComparisonService = {

  createMarketComparison,

  createManyMarketComparisons,

  getAllMarketComparisons,

  getMarketComparisonsByProduct,

  getSingleMarketComparison,

  deleteMarketComparison,

};