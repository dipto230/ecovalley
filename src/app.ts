import express, { Application,  Request, Response } from 'express';
import cors from "cors";
import path from "path";
import { IndexRoutes } from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';
import { envVars } from './config/env';
const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(cors({
    origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization"]
}))


app.use("/api/auth", toNodeHandler(auth))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", IndexRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
}
);


// app.get('/', async (req: Request, res: Response) => {
//     const category = await prisma.category.create({
//         data: {
//             name: 'Motherboard',
//             description: 'A computer motherboard'
//         }
//     })
//     res.status(201).json({
//         success: true,
//         message: 'Category created successfully',
//         data: category
//     })
// })


app.use(globalErrorHandler)
app.use(notFound)

export default app;