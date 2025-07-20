import express from 'express'
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';
import { fetchAllOrdersFromPayment, fetchUserOrdersFromPayment,forwardUpdateOrderStatus, fetchOrderStatsFromPayment  } from '../controllers/OrderController.js';

const orderRouter = express.Router();

orderRouter.get('/user', authUser, fetchUserOrdersFromPayment);
orderRouter.get('/seller', authSeller, fetchAllOrdersFromPayment);
orderRouter.put('/:id/status', forwardUpdateOrderStatus)
orderRouter.get('/dashboard', authSeller, fetchOrderStatsFromPayment);


export default orderRouter;