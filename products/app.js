import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import 'dotenv/config' ;
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/ProductRoute.js';



const app = express();
const port = process.env.PORT || 3000;


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

app.use('/api/product', productRouter)


app.listen(port, () => {
    console.log(`Server is running on  http://localhost:${port}`);
})