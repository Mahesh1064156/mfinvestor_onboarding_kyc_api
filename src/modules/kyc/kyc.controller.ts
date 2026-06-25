
import { Request, Response } from "express";
import { getKycByUserService, submitKycService } from "./kyc.service";

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const kyc = await submitKycService(req.body);

    res.status(201).json({
      message: "KYC submitted successfully",
      kyc,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      res.status(400).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to submit KYC",
    });
  }
};

export const getKycByUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      res.status(400).json({
        error: "Valid user ID is required",
      });
      return;
    }

    const kyc = await getKycByUserService(userId);

    if (!kyc) {
      res.status(404).json({
        error: "KYC details not found",
      });
      return;
    }

    res.status(200).json({
      kyc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch KYC details",
    });
  }
};

