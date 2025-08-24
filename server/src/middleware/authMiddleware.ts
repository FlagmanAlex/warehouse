import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Расширение Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;


  if (!token) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return 
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.log('Токен просрочен', error);
      res.status(401).json({ error: 'Токен просрочен' });
      return 
    }
    console.log('Неверный токен', error);
    res.status(401).json({ error: 'Неверный токен' });
    return 
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    console.log('Доступ запрещён');
    res.status(403).json({ error: 'Доступ запрещён' });
    return 
  }
  next();
};