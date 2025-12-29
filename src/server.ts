import express from "express";
import authRoutes from "./routes/auth.routes.js"

const app = express();
app.use(express.json());
const PORT = 5000;

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json("Hello from server!");
});

app.listen(PORT, () => {
  console.log(`Server up and running on ${PORT}`);
});
