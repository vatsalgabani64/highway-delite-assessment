import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

const mongoURI = process.env.MONGODB_URI!;
mongoose.connect(mongoURI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});