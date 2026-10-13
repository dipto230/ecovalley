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
  IRecoveryAnalysisInput,
  IRecoveryMaterialInput,
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


//new code 
const MATERIAL_RATE_DEFAULTS: Record<string, number> = {
  copper: 700,
  aluminum: 150,
  iron: 30,
  steel: 35,
  plastic: 15,
  "circuit board": 120,
  glass: 5,
  "lithium battery": 180,
  other: 10,
};

const normalizeMaterialName = (name: string): string => {
  const normalized = name
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .trim();

  const aliases: Record<string, string> = {
    aluminium: "aluminum",
    "printed circuit board": "circuit board",
    pcb: "circuit board",
    battery: "lithium battery",
    "lithium ion battery": "lithium battery",
    "ferrous metal": "iron",
    "steel metal": "steel",
    "plastic casing": "plastic",
  };

  const resolved = aliases[normalized] ?? normalized;

  return MATERIAL_RATE_DEFAULTS[resolved] !== undefined
    ? resolved
    : "other";
};

const getMaterialRate = (materialName: string): number => {
  const envKey = `E_WASTE_RATE_${materialName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")}_INR_KG`;

  const configuredRate = process.env[envKey];

  if (configuredRate !== undefined) {
    const parsedRate = Number(configuredRate);

    if (Number.isFinite(parsedRate) && parsedRate >= 0) {
      return parsedRate;
    }
  }

  return MATERIAL_RATE_DEFAULTS[materialName] ?? 0;
};

const safeNumber = (value: unknown): number | null => {
  const parsed = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(parsed)
  ) {
    return null;
  }

  return parsed;
};

const clampPercent = (value: unknown): number => {
  const parsed = safeNumber(value) ?? 0;

  return Math.min(100, Math.max(0, parsed));
};

const parseAiJson = <T>(text: string): T => {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AppError(
      status.BAD_GATEWAY,
      "AI returned invalid JSON"
    );
  }
};

const normalizeRecoveryAnalysis = (
  raw: IRecoveryAnalysisInput
): IRecoveryAnalysisInput => {
  const recommendation =
    raw.recommendation === "REUSE" ||
    raw.recommendation === "REPAIR" ||
    raw.recommendation === "RECYCLE"
      ? raw.recommendation
      : "RECYCLE";

  const materials: IRecoveryMaterialInput[] = (
    Array.isArray(raw.materials) ? raw.materials : []
  )
    .filter(
      (material) =>
        material &&
        typeof material.materialName === "string"
    )
    .map((material) => {
      const min = Math.max(
        0,
        safeNumber(material.estimatedWeightMinGrams) ?? 0
      );

      const max = Math.max(
        min,
        safeNumber(material.estimatedWeightMaxGrams) ?? min
      );

      return {
        materialName: normalizeMaterialName(
          material.materialName
        ),
        estimatedWeightMinGrams: min,
        estimatedWeightMaxGrams: max,
        recoveryRatePercent: clampPercent(
          material.recoveryRatePercent
        ),
        confidenceScore: clampPercent(
          material.confidenceScore
        ),
        notes:
          typeof material.notes === "string"
            ? material.notes.slice(0, 1000)
            : "",
      };
    })
    .filter(
      (material) =>
        material.estimatedWeightMaxGrams > 0
    );

  if (materials.length === 0) {
    throw new AppError(
      status.UNPROCESSABLE_ENTITY,
      "AI could not estimate recoverable materials"
    );
  }

  return {
    estimatedTotalWeightMinGrams: Math.max(
      0,
      safeNumber(raw.estimatedTotalWeightMinGrams) ?? 0
    ),
    estimatedTotalWeightMaxGrams: Math.max(
      0,
      safeNumber(raw.estimatedTotalWeightMaxGrams) ?? 0
    ),
    recommendation,
    recommendationReason:
      typeof raw.recommendationReason === "string"
        ? raw.recommendationReason.slice(0, 2000)
        : "Physical inspection is recommended.",
    assumptions:
      typeof raw.assumptions === "string"
        ? raw.assumptions.slice(0, 3000)
        : "Material quantities are image-based estimates.",
    confidenceScore: clampPercent(raw.confidenceScore),
    materials,
  };
};

































































const estimateImagePrice = async (imageUrl: string) => {
  if (!imageUrl) {
    throw new AppError(
      status.BAD_REQUEST,
      "Image URL is required"
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "GEMINI_API_KEY is not configured"
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
Analyze this electronic product image for market identification
and approximate e-waste recovery planning.

Return ONLY valid JSON in this structure:
{
  "detectedCategory": "string or null",
  "detectedBrand": "string or null",
  "detectedModel": "string or null",
  "condition": "NEW, USED, REFURBISHED, or null",
  "confidenceScore": 0,
  "recovery": {
    "estimatedTotalWeightMinGrams": 0,
    "estimatedTotalWeightMaxGrams": 0,
    "recommendation": "REUSE, REPAIR, or RECYCLE",
    "recommendationReason": "string",
    "assumptions": "string",
    "confidenceScore": 0,
    "materials": [
      {
        "materialName": "copper",
        "estimatedWeightMinGrams": 0,
        "estimatedWeightMaxGrams": 0,
        "recoveryRatePercent": 0,
        "confidenceScore": 0,
        "notes": "string"
      }
    ]
  }
}

Rules:
- Never invent a brand or model.
- Weight values must be in grams.
- Confidence and recoveryRatePercent must be between 0 and 100.
- Use only these material names:
  copper, aluminum, iron, steel, plastic, circuit board,
  glass, lithium battery, other.
- Include only plausible materials for the identified device.
- Material weights represent estimated material content, not the
  weight of the entire device repeated for each material.
- Keep estimated material quantities plausible and avoid double-counting.
- If the device cannot be weighed from the image, provide a broad
  estimate based on its apparent category and explain this assumption.
- Do not claim exact precious-metal content from an image.
- If a battery or circuit board cannot be confirmed, state that
  uncertainty in notes or assumptions.
- REUSE means the device may be usable as-is; REPAIR means repair
  may be worthwhile; RECYCLE means material recovery may be preferable.
- These are visual estimates, not laboratory measurements.
`,
          },
        ],
      },
    ],
  });

  const aiText = response.text;

  if (!aiText) {
    throw new AppError(
      status.BAD_GATEWAY,
      "AI returned an empty response"
    );
  }

  type DetectedProduct = {
    detectedCategory?: string | null;
    detectedBrand?: string | null;
    detectedModel?: string | null;
    condition?: string | null;
    confidenceScore?: number;
    recovery?: IRecoveryAnalysisInput;
  };

  const detected = parseAiJson<DetectedProduct>(aiText);

  if (!detected.detectedCategory) {
    throw new AppError(
      status.UNPROCESSABLE_ENTITY,
      "Could not identify the product"
    );
  }

  if (!detected.recovery) {
    throw new AppError(
      status.BAD_GATEWAY,
      "AI did not return a recovery analysis"
    );
  }

  const recovery = normalizeRecoveryAnalysis(
    detected.recovery
  );

  const rawCondition = detected.condition?.toUpperCase();

  const condition: ProductCondition | null =
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

  // Existing market-price estimation logic is preserved.
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

  const detectionConfidence = clampPercent(
    detected.confidenceScore
  );

  // Material values are based on estimated recoverable weight.
  const calculatedMaterials = recovery.materials.map(
    (material) => {
      const pricePerKg = getMaterialRate(
        material.materialName
      );

      const recoveredWeightMinGrams =
        material.estimatedWeightMinGrams *
        material.recoveryRatePercent / 100;

      const recoveredWeightMaxGrams =
        material.estimatedWeightMaxGrams *
        material.recoveryRatePercent / 100;

      const estimatedValueMin =
        recoveredWeightMinGrams * pricePerKg / 1000;

      const estimatedValueMax =
        recoveredWeightMaxGrams * pricePerKg / 1000;

      return {
        ...material,
        pricePerKg,
        recoveredWeightMinGrams,
        recoveredWeightMaxGrams,
        estimatedValueMin,
        estimatedValueMax,
      };
    }
  );

  const grossValueMin = calculatedMaterials.reduce(
    (sum, material) => sum + material.estimatedValueMin,
    0
  );

  const grossValueMax = calculatedMaterials.reduce(
    (sum, material) => sum + material.estimatedValueMax,
    0
  );

  const parseCost = (
    value: string | undefined,
    fallback: number
  ) => {
    const parsed = value === undefined ? fallback : Number(value);

    return Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : fallback;
  };

  const processingCostMin = parseCost(
    process.env.E_WASTE_PROCESSING_COST_MIN_INR,
    20
  );

  const processingCostMax = Math.max(
    processingCostMin,
    parseCost(
      process.env.E_WASTE_PROCESSING_COST_MAX_INR,
      60
    )
  );

  const netValueMin = grossValueMin - processingCostMax;
  const netValueMax = grossValueMax - processingCostMin;

  // Save market prices and the recovery report together.
  const savedEstimate = await prisma.imagePriceEstimate.create({
    data: {
      imageUrl,
      detectedCategory: detected.detectedCategory,
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

      recoveryReport: {
        create: {
          deviceCategory: detected.detectedCategory,
          deviceBrand: detected.detectedBrand ?? null,
          deviceModel: detected.detectedModel ?? null,

          estimatedWeightMinGrams:
            recovery.estimatedTotalWeightMinGrams,

          estimatedWeightMaxGrams:
            recovery.estimatedTotalWeightMaxGrams,

          estimatedGrossValueMin:
            new Prisma.Decimal(grossValueMin),

          estimatedGrossValueMax:
            new Prisma.Decimal(grossValueMax),

          processingCostMin:
            new Prisma.Decimal(processingCostMin),

          processingCostMax:
            new Prisma.Decimal(processingCostMax),

          estimatedNetValueMin:
            new Prisma.Decimal(netValueMin),

          estimatedNetValueMax:
            new Prisma.Decimal(netValueMax),

          currency: "INR",
          recommendation: recovery.recommendation,
          recommendationReason: recovery.recommendationReason,
          assumptions: recovery.assumptions,
          confidenceScore: recovery.confidenceScore,
          aiModel,

          materials: {
            create: calculatedMaterials.map((material) => ({
              materialName: material.materialName,

              estimatedWeightMinGrams:
                material.estimatedWeightMinGrams,

              estimatedWeightMaxGrams:
                material.estimatedWeightMaxGrams,

              // Stored as a percentage from 0 to 100.
              recoveryRate: material.recoveryRatePercent,

              recoveredWeightMinGrams:
                material.recoveredWeightMinGrams,

              recoveredWeightMaxGrams:
                material.recoveredWeightMaxGrams,

              pricePerKg:
                new Prisma.Decimal(material.pricePerKg),

              estimatedValueMin:
                new Prisma.Decimal(material.estimatedValueMin),

              estimatedValueMax:
                new Prisma.Decimal(material.estimatedValueMax),

              confidenceScore: material.confidenceScore,
              notes: material.notes,
            })),
          },
        },
      },
    },

    include: {
      sources: true,
      recoveryReport: {
        include: {
          materials: true,
        },
      },
    },
  });

  return savedEstimate;
};




export const PriceEstimationService = {
  estimateProductPrice,
  estimateImagePrice,
};