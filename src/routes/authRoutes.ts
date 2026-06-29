import express from "express";
import { signup } from "../controllers/authcontroller.js";
import { signin } from "../controllers/authcontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import {
  googleLogin,
} from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google",googleLogin)
router.get("/me", authMiddleware, (req, res) => {
    res.json({
      message: "Protected route accessed",
    });
  });


export default router;