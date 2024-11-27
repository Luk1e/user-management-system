import express from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "../routes/userRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/auth", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
