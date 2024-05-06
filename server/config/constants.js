import dotenv from "dotenv";
dotenv.config();

const AppConstants = {
  PORT: 3000,
  DB_CONFIG: {
    host: "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
  },
  QUERY_YES: 1,
  QUERY_NO: 0,
  JWT_TOKEN_EXPIRATION: 1_800_000
}

export default AppConstants;