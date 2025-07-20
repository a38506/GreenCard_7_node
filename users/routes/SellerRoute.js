import express from 'express'
import { isSellerAuth, sellerLogin, sellerLogout, blockUser, getAllUsers } from '../controllers/SellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);
sellerRouter.put('/block/:id', authSeller ,blockUser);
sellerRouter.get('/all', authSeller , getAllUsers);

export default sellerRouter