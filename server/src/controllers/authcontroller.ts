import type { Request, Response } from "express";
import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupSchema } from "../validations/authValidation.js";


export const signup = async (req: Request, res: Response) => {
  try {
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
    return res.status(400).json({
    errors:validation.error.issues.map((err) => err.message),
  });
}
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
    try {
        const validation = signupSchema.safeParse(req.body);

        if (!validation.success) {
        return res.status(400).json({
         errors: validation.error.issues.map((err) => err.message),
         });
}
      const { email, password } = req.body;
  
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }
  
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
      );
  
      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }
  
      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "7d",
        }
      );
  
      res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
      });
    }

 
  };

  