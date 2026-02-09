import { Router } from "express";
import { explainTax } from "../controllers/tax.controller";

const router = Router();
router.post("/explain", explainTax); 

export default router;
