import express from "express";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "https://invento-five.vercel.app",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server up and running on ${process.env.PORT}`);
});
