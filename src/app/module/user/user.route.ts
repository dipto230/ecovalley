import {  Router } from "express";
import { UserController } from "./user.controller";


import { validateRequest } from "../../middleware/validationRequest";
import { createVendorZodSchema } from "./user.validation";




const router = Router()


router.post("/create-vendor", validateRequest(createVendorZodSchema), 
    
    // (req: Request, res: Response, next: NextFunction) => {
  
    // const parsedResult = createVendorZodSchema.safeParse(req.body);
    // if (!parsedResult.success) {
    //     next(parsedResult.error)
    // }
    // req.body = parsedResult.data;
    // next();
    

    // },
    
    UserController.createVendor)
export const UserRoute = router