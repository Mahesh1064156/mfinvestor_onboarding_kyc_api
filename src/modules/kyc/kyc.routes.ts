
import express from "express";
import { uploadDocument } from "./kyc.controller";
import upload from "../../common/middleware/upload.middleware"

import { getKycByUser, submitKyc } from "./kyc.controller";
const kycRouter = express.Router();
kycRouter.post("/submit", submitKyc);
kycRouter.get("/:userId", getKycByUser);
kycRouter.post(
  "/upload-document",
  upload.single("file"),
  uploadDocument
);
export default kycRouter;


