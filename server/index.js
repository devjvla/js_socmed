import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import AppConstants from "./config/constants.js";
import dotenv from "dotenv";
import UserRouter from "./routes/user.routes.js";
import PostRouter from "./routes/post.routes.js";

// To enable usage of process.env variables
dotenv.config();

// Enumerate variables to be used from AppConstants
const { PORT } = AppConstants;

// Setup Express App
const App = Express();
App.use(Express.json());

// Setup CORS
App.use(cors({
  credentials: true,
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

App.use(cookieParser());

// Setup Routes
App.use(`/${process.env.API_PREFIX}/users`, UserRouter);
App.use(`/${process.env.API_PREFIX}/posts`, PostRouter);

App.listen(PORT, () => {  
  console.log(`Running on http://localhost:${PORT}`);
});