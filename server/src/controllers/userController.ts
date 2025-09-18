import dotenv from 'dotenv';
dotenv.config();

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '@models';
import { IUser } from '@interfaces';
import { ResponseUserDto } from '@interfaces/DTO';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface CreateUserRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
    role?: string;
  };
}

export const userController = {
  async checkToken(req: Request, res: Response) {
    res.status(200).json({ message: 'Token is valid' });
  },
  // Регистрация нового пользователя
  async register(req: CreateUserRequest, res: Response) {
    try {
      const { username, email, password, role = 'user' } = req.body;

      // Валидация
      if (!username || !email || !password) {
        console.log('Все поля обязательны');
        res.status(400).json({ error: 'Все поля обязательны' });
        return
      }

      // Проверка уникальности email
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        console.log('Email уже используется');
        res.status(400).json({ message: 'Email уже используется' });
        return
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        role,
      });

      await user.save();

      // Генерация JWT-токена
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Авторизация
  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      const user: IUser | null = await UserModel.findOne({ email });
      if (user) {
        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log('Неверный email или пароль');
          res.status(401).json({ error: 'Неверный email или пароль' });
          return
        }
        
        // Генерация токена
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const resp:ResponseUserDto = {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          token
        }

        res.json(resp);
      } else {
        console.log('Неверный email или пароль');
        res.status(401).json({ error: 'Неверный email или пароль' });
      }

    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Получение данных текущего пользователя
  async getProfile(req: Request, res: Response) {
    const { userId } = req.body
    try {
      const user = await UserModel.findById(userId).select('-password');
      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return
      }
      res.json(user);
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Обновление роли (только для админа)
  async updateRole(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      if (!['admin', 'manager', 'user'].includes(role)) {
        res.status(400).json({ error: 'Недопустимая роль' });
        return
      }

      if (req.userRole !== 'admin') { // Проверка роли текущего пользователя
        res.status(403).json({ error: 'Доступ запрещён' });
        return
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return
      }

      res.json(user);
    } catch (error) {
      console.error('Ошибка обновления роли:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Получение списка пользователей (с пагинацией)
  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await UserModel.find()
        .select('-password')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await UserModel.countDocuments();

      res.json({
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      });
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};