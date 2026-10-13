import dotenv from 'dotenv'
import AppError from '../app/errorHelpers/AppError';
import status from 'http-status';
dotenv.config()
interface EnvConfig{
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_UPDATE_AGE: string
    EMAIL_SENDER:{
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_FROM: string;
    }
    SERPAPI_KEY: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    GEMINI_API_KEY: string;
    FRONTEND_URL: string;
    STRIPE_SECRET_KEY: string;
    E_WASTE_RATE_COPPER_INR_KG: string;
E_WASTE_RATE_ALUMINUM_INR_KG: string;
E_WASTE_RATE_IRON_INR_KG: string;
E_WASTE_RATE_STEEL_INR_KG: string;
E_WASTE_RATE_PLASTIC_INR_KG: string;
E_WASTE_RATE_CIRCUIT_BOARD_INR_KG: string;
E_WASTE_RATE_GLASS_INR_KG: string;
E_WASTE_RATE_LITHIUM_BATTERY_INR_KG: string;
E_WASTE_RATE_OTHER_INR_KG: string;
E_WASTE_PROCESSING_COST_MIN_INR: string;
    E_WASTE_PROCESSING_COST_MAX_INR: string;
    METALS_DEV_API_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    CLOUDINARY:{
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    }
}
const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariable = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'BETTER_AUTH_SECRET',
        'BETTER_AUTH_URL',
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'ACCESS_TOKEN_EXPIRES_IN',
        'REFRESH_TOKEN_EXPIRES_IN',
        'BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN',
        'BETTER_AUTH_SESSION_UPDATE_AGE',
        'EMAIL_SENDER_SMTP_USER',
        'EMAIL_SENDER_SMTP_PASS',
        'EMAIL_SENDER_SMTP_HOST',
        'METALS_DEV_API_KEY',
        'EMAIL_SENDER_SMTP_PORT',
        'EMAIL_SENDER_SMTP_FROM',
         'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_CALLBACK_URL',
        'FRONTEND_URL',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'SERPAPI_KEY',
        'CLOUDINARY_API_SECRET',
        'STRIPE_SECRET_KEY',
        'GEMINI_API_KEY',
        'STRIPE_WEBHOOK_SECRET'

    ]
    requiredEnvVariable.forEach((variable) => {
        if (!process.env[variable]) {
            //throw new Error(`Environment variable ${variable} is required but not set in .env file `)
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file`)
        }
    })
    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
        METALS_DEV_API_KEY: process.env.METALS_DEV_API_KEY as string,
        BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
        SERPAPI_KEY: process.env.SERPAPI_KEY as string,
        E_WASTE_RATE_COPPER_INR_KG: process.env.E_WASTE_RATE_COPPER_INR_KG ?? "700",
E_WASTE_RATE_ALUMINUM_INR_KG: process.env.E_WASTE_RATE_ALUMINUM_INR_KG ?? "150",
E_WASTE_RATE_IRON_INR_KG: process.env.E_WASTE_RATE_IRON_INR_KG ?? "30",
E_WASTE_RATE_STEEL_INR_KG: process.env.E_WASTE_RATE_STEEL_INR_KG ?? "35",
E_WASTE_RATE_PLASTIC_INR_KG: process.env.E_WASTE_RATE_PLASTIC_INR_KG ?? "15",
E_WASTE_RATE_CIRCUIT_BOARD_INR_KG: process.env.E_WASTE_RATE_CIRCUIT_BOARD_INR_KG ?? "120",
E_WASTE_RATE_GLASS_INR_KG: process.env.E_WASTE_RATE_GLASS_INR_KG ?? "5",
E_WASTE_RATE_LITHIUM_BATTERY_INR_KG: process.env.E_WASTE_RATE_LITHIUM_BATTERY_INR_KG ?? "180",
E_WASTE_RATE_OTHER_INR_KG: process.env.E_WASTE_RATE_OTHER_INR_KG ?? "10",
E_WASTE_PROCESSING_COST_MIN_INR: process.env.E_WASTE_PROCESSING_COST_MIN_INR ?? "20",
E_WASTE_PROCESSING_COST_MAX_INR: process.env.E_WASTE_PROCESSING_COST_MAX_INR ?? "60",
        BETTER_AUTH_SESSION_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_UPDATE_AGE as string,
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
            SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
            SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
            SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
            SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
        },
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
         CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        }

    }
}
export const envVars = loadEnvVariables();