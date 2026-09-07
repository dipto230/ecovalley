import status from "http-status";
import { GoogleGenAI } from "@google/genai";

import {
  ProductCondition,
} from "../../../generated/prisma/client";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

import {
  IAnalyzeProductImage,
} from "./ai-detection.interface";

import { PriceEstimationService } from "../price-estimation/price-estimation.service";

const aiModel = "gemini-2.5-flash";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const normalizeCondition = (
  condition: string | null | undefined
): ProductCondition | null => {

  if (!condition) {
    return null;
  }

  const normalized = condition
    .toUpperCase()
    .trim();

  if (
    normalized === "NEW" ||
    normalized === "USED" ||
    normalized === "REFURBISHED"
  ) {
    return normalized as ProductCondition;
  }

  return null;
};


const extractJson = (text: string) => {

  try {

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);

  } catch (error) {

    console.error(
      "Gemini JSON Parse Error:",
      error
    );

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to parse AI response"
    );
  }
};


const analyzeProductImage = async (
  payload: IAnalyzeProductImage
) => {

  const {
    productId,
    imageUrl,
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


 

  if (!imageUrl) {

    throw new AppError(
      status.BAD_REQUEST,
      "Image URL is required"
    );
  }


 

  let imageResponse: Response;

  try {

    imageResponse =
      await fetch(imageUrl);

  } catch (error) {

    console.error(
      "Image Fetch Error:",
      error
    );

    throw new AppError(
      status.BAD_GATEWAY,
      "Failed to access uploaded image"
    );
  }


  if (!imageResponse.ok) {

    throw new AppError(
      status.BAD_GATEWAY,
      "Failed to download image from Cloudinary"
    );
  }


  const imageBuffer =
    Buffer.from(
      await imageResponse.arrayBuffer()
    );


  const base64Image =
    imageBuffer.toString("base64");


 

  const mimeType =
    imageResponse.headers.get(
      "content-type"
    ) || "image/jpeg";




  const prompt = `
You are an AI product identification system.

Analyze the uploaded product image carefully.

Identify the product shown in the image.

Determine:

1. detectedCategory
2. detectedBrand
3. detectedModel
4. condition
5. confidenceScore

Possible categories:

- Mobile
- Mobile Display
- Laptop
- Laptop Display
- Desktop
- Motherboard
- CPU
- GPU
- RAM
- SSD
- HDD
- Power Supply
- Keyboard
- Mouse
- Charger
- Smartphone
- Tablet
- Monitor
- Camera
- Printer
- Other

Condition MUST be exactly one of:

NEW
USED
REFURBISHED

If condition cannot be determined, return null.

If brand cannot be identified, return null.

If model cannot be identified, return null.

confidenceScore must be a number between 0 and 100.

IMPORTANT:

- Do not invent a brand.
- Do not invent a model.
- Only identify information that can reasonably be determined from the image.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanations.

Return this exact structure:

{
  "detectedCategory": "Motherboard",
  "detectedBrand": "ASUS",
  "detectedModel": "PRIME B550M-A",
  "condition": "USED",
  "confidenceScore": 91
}
`;




  let response;

  try {

    response =
      await genAI.models.generateContent({

        model: aiModel,

        contents: [
          {
            role: "user",

            parts: [

              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },

              {
                text: prompt,
              },

            ],
          },
        ],
      });

  } catch (error) {

    console.error(
      "Gemini API Error:",
      error
    );

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "AI image analysis failed"
    );
  }


  

  const responseText =
    response.text;


  if (!responseText) {

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Empty response received from AI"
    );
  }


  console.log(
    "Gemini Response:",
    responseText
  );




  const aiResult =
    extractJson(responseText);


  const condition =
    normalizeCondition(
      aiResult.condition
    );


  const confidenceScore =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          aiResult.confidenceScore
        ) || 0
      )
    );




  const detection =
    await prisma.aIDetection.create({

      data: {

        productId,

        detectedCategory:
          aiResult.detectedCategory ||
          null,

        detectedBrand:
          aiResult.detectedBrand ||
          null,

        detectedModel:
          aiResult.detectedModel ||
          null,

        condition,

        confidenceScore,

        aiModel,
      },
    });




  await prisma.product.update({

    where: {
      id: productId,
    },

    data: {

      ...(aiResult.detectedBrand
        ? {
            brand:
              aiResult.detectedBrand,
          }
        : {}),

      ...(aiResult.detectedModel
        ? {
            model:
              aiResult.detectedModel,
          }
        : {}),

      ...(condition
        ? {
            condition,
          }
        : {}),
    },
  });




  let priceEstimation = null;

  try {

    priceEstimation =
      await PriceEstimationService
        .estimateProductPrice(
          productId
        );

  } catch (error) {

    console.error(
      "Price estimation failed:",
      error
    );

   
  }




  return {

    detection,

    imageUrl,

    priceEstimation,
  };
};


export const AIDetectionService = {
  analyzeProductImage,
};