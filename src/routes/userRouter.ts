import express from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

export const userRouter = express.Router();

// Публичные маршруты
userRouter.post('/register', userController.register); 
userRouter.post('/login', userController.login);
// Защищённые маршруты
userRouter.get('/profile', authMiddleware, userController.getProfile); 
userRouter.get('/users', authMiddleware, adminMiddleware, userController.getUsers);
// Только для админов
userRouter.patch('/users/:id/role', authMiddleware, adminMiddleware, userController.updateRole);
