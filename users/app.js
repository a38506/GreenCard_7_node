import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config' ;
import userRouter from './routes/UserRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import sellerRouter from './routes/SellerRoute.js';
import cartRouter from './routes/CartRoute.js';

const app = express();
const port = process.env.PORT || 3001;


await connectDB();
await connectCloudinary();

// Allowed origins 
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174' , 'http://103.178.234.70:5000', 'http://103.178.234.70:5001'];


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
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/cart', cartRouter)

app.listen(port, () => {
    console.log(`Server is running on  http://localhost:${port}`);
})