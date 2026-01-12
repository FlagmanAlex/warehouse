import express from 'express';
import { body } from 'express-validator'
import { userController } from '@controllers';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

export const userRouter = express.Router();

// Публичные маршруты
userRouter.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('username').notEmpty()
], userController.register);
userRouter.post('/login', userController.login);
// Защищённые маршруты
userRouter.get('/profile', userController.getProfile);
userRouter.get('/users', adminMiddleware, userController.getUsers);
// Только для админов
userRouter.patch('/users/:id/role', adminMiddleware, userController.updateRole);
userRouter.get('/check', authMiddleware, userController.checkToken);