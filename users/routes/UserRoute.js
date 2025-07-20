import express from 'express';
import { isAuth, login, logout, register, clearUserCart } from '../controllers/UserController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logout);
userRouter.put('/:id/clear-cart', authUser, clearUserCart);


export default userRouter;