import { Request, Response } from "express";
import { registerUserService } from "./auth.service";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const userId = await registerUserService(req.body);

    res.status(201).json({
      user_id: userId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to register user",
    });
  }
};