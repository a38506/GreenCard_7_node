import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB  from './configs/db.js';

import 'dotenv/config';
import connectCloudinary from './configs/cloudinary.js';
import addressRouter from './routes/AddressRoute.js';
import paymentRouter from './routes/PaymentRoute.js';
import { stripeWebhooks } from './controllers/PaymentController.js';

const app = express();
const port = process.env.PORT || 3002;


await connectDB();
await connectCloudinary();

app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhooks)

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
app.use('/api/payment', paymentRouter)
app.use('/api/address', addressRouter)

app.listen(port, () => {
    console.log(`Server is running on  http://localhost:${port}`);
})