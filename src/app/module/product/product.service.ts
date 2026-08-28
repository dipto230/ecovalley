import status from "http-status";

import {
  Prisma,
  Product,
} from "../../../generated/prisma/client";

import {
  ProductStatus,
  Role,
} from "../../../generated/prisma/enums";

import AppError from "../../errorHelpers/AppError";

import {
  IQueryParams,
  
} from "../../interfaces/query.interface";

import { prisma } from "../../lib/prisma";

import { QueryBuilder } from "../../utils/QueryBuilder";

import {
  productFilterableFields,
  productIncludeConfig,
  productSearchableFields,
} from "./product.constant";

import {
  ICreateProduct,
  IProductActor,
  IUpdateProduct,
} from "./product.interface";




const createProduct = async (
  payload: ICreateProduct,
  actor: IProductActor
) => {

  let vendorId = payload.vendorId;


 

  if (actor.role === Role.VENDOR) {

    const vendor = await prisma.vendors.findUnique({
      where: {
        userId: actor.userId,
      },
    });

    if (!vendor || vendor.isDeleted) {
      throw new AppError(
        status.NOT_FOUND,
        "Vendor profile not found"
      );
    }

    if (vendor.status !== "ACTIVE") {
      throw new AppError(
        status.FORBIDDEN,
        "Vendor is not active"
      );
    }

    vendorId = vendor.id;
  }


 

  if (!vendorId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Vendor ID is required"
    );
  }




  const vendor = await prisma.vendors.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (!vendor || vendor.isDeleted) {
    throw new AppError(
      status.NOT_FOUND,
      "Vendor not found"
    );
  }




  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(
      status.NOT_FOUND,
      "Category not found"
    );
  }




  const product = await prisma.product.create({
    data: {
      title: payload.title,
      description: payload.description,
      brand: payload.brand,
      model: payload.model,

      condition: payload.condition,

      quantity: payload.quantity ?? 1,

      estimatedPrice: new Prisma.Decimal(
        payload.estimatedPrice
      ),

      // New product always PENDING
      status: ProductStatus.PENDING,

      vendorId,

      categoryId: payload.categoryId,
    },

    include: {
      vendor: true,
      category: true,
      productImages: true,
      priceEstimations: true,
      aiDetections: true,
      marketComparisons: true,
      offers: true,
    },
  });


  return product;
};




const getAllProducts = async (
  query: IQueryParams
) => {

  const queryBuilder = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(
    prisma.product,
    query,
    {
      searchableFields:
        productSearchableFields,

      filterableFields:
        productFilterableFields,
    }
  );


  const result = await queryBuilder

    .search()

    .filter()

    .where({
      vendor: {
        isDeleted: false,
      },
    })

    .dynamicInclude(
      productIncludeConfig as Record<
        string,
        unknown
      >,
      [
        "vendor",
        "category",
      ]
    )

    .paginate()

    .sort()

    .fields()

    .execute();


  return result;
};




const getSingleProduct = async (
  id: string,
  query: IQueryParams
) => {

  const queryBuilder = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(
    prisma.product,
    query,
    {
      searchableFields:
        productSearchableFields,

      filterableFields:
        productFilterableFields,
    }
  );


  const result = await queryBuilder

    .where({
      id,

      vendor: {
        isDeleted: false,
      },
    })

    .dynamicInclude(
      productIncludeConfig as Record<
        string,
        unknown
      >,
      [
        "vendor",
        "category",
        "productImages",
      ]
    )

    .execute();


  if (result.data.length === 0) {
    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }


  return result.data[0];
};




const updateProduct = async (
  id: string,
  payload: IUpdateProduct,
  actor: IProductActor
) => {

  

  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        vendor: true,
      },
    });


  if (!existingProduct) {
    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }



  if (actor.role === Role.VENDOR) {

    if (
      existingProduct.vendor.userId !==
      actor.userId
    ) {

      throw new AppError(
        status.FORBIDDEN,
        "You can only update your own products"
      );
    }
  }




  if (
    actor.role === Role.VENDOR &&
    payload.vendorId
  ) {

    throw new AppError(
      status.FORBIDDEN,
      "Vendor cannot change product ownership"
    );
  }


  if (payload.vendorId) {

    const vendor =
      await prisma.vendors.findUnique({
        where: {
          id: payload.vendorId,
        },
      });


    if (!vendor || vendor.isDeleted) {

      throw new AppError(
        status.NOT_FOUND,
        "Vendor not found"
      );
    }
  }


  if (payload.categoryId) {

    const category =
      await prisma.category.findUnique({
        where: {
          id: payload.categoryId,
        },
      });


    if (!category) {

      throw new AppError(
        status.NOT_FOUND,
        "Category not found"
      );
    }
  }


  

  const updateData: Prisma.ProductUpdateInput = {};


  if (payload.title !== undefined) {
    updateData.title = payload.title;
  }


  if (payload.description !== undefined) {
    updateData.description =
      payload.description;
  }


  if (payload.brand !== undefined) {
    updateData.brand = payload.brand;
  }


  if (payload.model !== undefined) {
    updateData.model = payload.model;
  }


  if (payload.condition !== undefined) {
    updateData.condition =
      payload.condition;
  }


  if (payload.quantity !== undefined) {
    updateData.quantity =
      payload.quantity;
  }


  if (
    payload.estimatedPrice !== undefined
  ) {

    updateData.estimatedPrice =
      new Prisma.Decimal(
        payload.estimatedPrice
      );
  }


 

  if (
    payload.status !== undefined &&
    actor.role !== Role.VENDOR
  ) {

    updateData.status =
      payload.status;
  }


  

  if (payload.vendorId) {

    updateData.vendor = {
      connect: {
        id: payload.vendorId,
      },
    };
  }


  
  if (payload.categoryId) {

    updateData.category = {
      connect: {
        id: payload.categoryId,
      },
    };
  }


 

  const product =
    await prisma.product.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        vendor: true,
        category: true,
        productImages: true,
        priceEstimations: true,
        aiDetections: true,
        marketComparisons: true,
        offers: true,
      },
    });


  return product;
};




const deleteProduct = async (
  id: string,
  actor: IProductActor
) => {

  const product =
    await prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        vendor: true,
      },
    });


  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      "Product not found"
    );
  }


 

  if (actor.role === Role.VENDOR) {

    if (
      product.vendor.userId !==
      actor.userId
    ) {

      throw new AppError(
        status.FORBIDDEN,
        "You can only delete your own products"
      );
    }
  }


  await prisma.product.delete({
    where: {
      id,
    },
  });


  return null;
};




const getProductsByVendor = async (
  vendorId: string,
  query: IQueryParams
) => {

  const vendor =
    await prisma.vendors.findUnique({
      where: {
        id: vendorId,
      },
    });


  if (!vendor || vendor.isDeleted) {

    throw new AppError(
      status.NOT_FOUND,
      "Vendor not found"
    );
  }


  const queryBuilder = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(
    prisma.product,
    query,
    {
      searchableFields:
        productSearchableFields,

      filterableFields:
        productFilterableFields,
    }
  );


  return await queryBuilder

    .search()

    .filter()

    .where({
      vendorId,
    })

    .dynamicInclude(
      productIncludeConfig as Record<
        string,
        unknown
      >,
      [
        "vendor",
        "category",
        "productImages",
      ]
    )

    .paginate()

    .sort()

    .fields()

    .execute();
};




const getProductsByCategory = async (
  categoryId: string,
  query: IQueryParams
) => {

  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });


  if (!category) {

    throw new AppError(
      status.NOT_FOUND,
      "Category not found"
    );
  }


  const queryBuilder = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(
    prisma.product,
    query,
    {
      searchableFields:
        productSearchableFields,

      filterableFields:
        productFilterableFields,
    }
  );


  return await queryBuilder

    .search()

    .filter()

    .where({
      categoryId,
    })

    .dynamicInclude(
      productIncludeConfig as Record<
        string,
        unknown
      >,
      [
        "vendor",
        "category",
        "productImages",
      ]
    )

    .paginate()

    .sort()

    .fields()

    .execute();
};




const getProductsByStatus = async (
  productStatus: ProductStatus,
  query: IQueryParams
) => {

  const queryBuilder = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(
    prisma.product,
    query,
    {
      searchableFields:
        productSearchableFields,

      filterableFields:
        productFilterableFields,
    }
  );


  return await queryBuilder

    .where({
      status: productStatus,
    })

    .dynamicInclude(
      productIncludeConfig as Record<
        string,
        unknown
      >,
      [
        "vendor",
        "category",
        "productImages",
      ]
    )

    .paginate()

    .sort()

    .fields()

    .execute();
};



export const ProductService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsByVendor,
  getProductsByCategory,
  getProductsByStatus,
};