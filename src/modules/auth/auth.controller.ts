import { Request, Response } from "express";
import { registerUserService, loginUserService } from "./auth.service";

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
export const loginUser = async (req: Request, res: Response) => {
  try {
    const user = await loginUserService(req.body);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to login",
    });
  }
};
