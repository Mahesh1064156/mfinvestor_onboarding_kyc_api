
import express from "express";
import { getKycByUser, submitKyc } from "./kyc.controller";

const kycRouter = express.Router();

kycRouter.post("/submit", submitKyc);
kycRouter.get("/:userId", getKycByUser);

export default kycRouter;


