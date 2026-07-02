import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import aiRoutes from "./routes/aiRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);


app.listen(5000, () => {
  console.log("Server running");
});