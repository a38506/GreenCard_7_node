import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';

import 'dotenv/config';
// import connectCloudinary from './configs/cloudinary.js';
import orderRouter from './routes/OrderRoute.js';

const app = express();
const port = process.env.PORT || 3003;


// await connectDB();

// await connectCloudinary();

// Allowed origins 
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://103.178.234.70:5000', 'http://103.178.234.70:5001'];


// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.get('/', (req, res) => res.send('API is Working!'));
app.use('/api/order', orderRouter)

app.listen(port, () => {
    console.log(`Server is running on  http://localhost:${port}`);
})