import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import authRoute from './routes/authRoutes.js';

dotenv.config({ path: '../.env' }); 

console.log("MONGO_URL:", process.env.MONGO_URL);  

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});
