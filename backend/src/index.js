import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import { connectDB } from './lib/db.js';
import authRoute from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';


dotenv.config({ path: '../.env' }); 

console.log("MONGO_URL:", process.env.MONGO_URL);  

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
