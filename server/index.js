import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

// DB connect
dbConnection();

const port = process.env.PORT || 8800;

const app = express();

// ✅ FIXED CORS (LOCAL + DEPLOY BOTH)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://mern-task-manager-app.netlify.app",
    ],
    credentials: true, // 🔥 VERY IMPORTANT
  }),
);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// optional logger
app.use(morgan("dev"));

// routes
app.use("/api", routes);

// error handlers
app.use(routeNotFound);
app.use(errorHandler);

// start server
app.listen(port, () => console.log(`Server listening on ${port}`));
