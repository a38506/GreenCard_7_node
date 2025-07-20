import express from 'express'
import authUser from '../middlewares/authUser.js';
import { placeOrderCOD, placeOrderStripe, getUserOrders, getAllOrders, updateOrderStatus , getRevenueReport} from '../controllers/PaymentController.js';
import authSeller from '../middlewares/authSeller.js';

const paymentRouter = express.Router();

paymentRouter.post('/cod', authUser, placeOrderCOD);
paymentRouter.get('/user', authUser, getUserOrders);
paymentRouter.get('/seller', authSeller, getAllOrders);
paymentRouter.post('/stripe', authUser, placeOrderStripe);
paymentRouter.put('/orders/:id/status', authSeller, updateOrderStatus);
paymentRouter.get('/revenue', authSeller, getRevenueReport);


export default paymentRouter;