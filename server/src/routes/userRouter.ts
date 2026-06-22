import express from 'express';
import { body, validationResult } from 'express-validator'
import rateLimit from 'express-rate-limit';
import { userController } from '@controllers';
import { authMiddleware, adminMiddleware } from '@middlewares';

export const userRouter = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    limit: 20,
    message: { error: 'Слишком много запросов. Попробуйте через 15 минут.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

// Публичные маршруты (с rate limiting и валидацией)
userRouter.post('/register', authLimiter, [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 8 }).withMessage('Пароль не менее 8 символов'),
    body('username').notEmpty().isLength({ min: 3, max: 50 }).withMessage('Имя пользователя 3-50 символов'),
], validateRequest, userController.register);

userRouter.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен'),
], validateRequest, userController.login);

// Защищённые маршруты
userRouter.get('/profile', authMiddleware, userController.getProfile);
userRouter.get('/users', authMiddleware, adminMiddleware, userController.getUsers);
userRouter.patch('/users/:id/role', authMiddleware, adminMiddleware, userController.updateRole);
userRouter.get('/check', authMiddleware, userController.checkToken);