import express from "express";
import { signup } from "../controllers/authcontroller.js";
import { signin } from "../controllers/authcontroller.js";
import { authMiddleware } from "../middleware/authmiddleware.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/me", authMiddleware, (req, res) => {
    res.json({
      message: "Protected route accessed",
    });
  });


export default router;
