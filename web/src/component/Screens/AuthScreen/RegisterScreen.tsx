import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../api/fetchApi'; // ← Убедись, что путь правильный
import { TextField } from '../../../shared/TextFields';
import style from './RegisterScreen.module.css';
import { Button } from '../../../shared/Button';
import { THEME } from '@warehouse/interfaces/config';

// Типизация данных формы (опционально, если используешь TypeScript)
interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen = () => {
  const [user, setUser] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!user.username || !user.email || !user.password || !user.confirmPassword) {
      alert('Заполните все поля');
      return;
    }

    if (user.password !== user.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      await fetchApi('auth/register', 'POST', {
        username: user.username,
        email: user.email,
        password: user.password,
        role: 'user',
      });

      alert('Вы успешно зарегистрировались!');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error); // ← полезно для отладки
      alert('Не удалось зарегистрироваться. Попробуйте позже.');
    }
  };

  return (
    <div className={style.registerContainer}>
      <h1 className={style.registerTitle}>Регистрация</h1>

      <TextField
        placeholder="Имя пользователя"
        type="text"
        name="username"
        value={user?.username || ''}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
      />

      <TextField
        placeholder="Email"
        type="email"
        name="email"
        value={user?.email || ''}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />

      <TextField
        placeholder="Пароль"
        type="password"
        name="password"
        value={user?.password || ''}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />

      <TextField
        placeholder="Повторите пароль"
        type="password"
        name="confirmPassword"
        value={user?.confirmPassword || ''}
        onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
      />

      {/* Вариант 1: Кастомный Button */}
      <Button
        onClick={handleRegister}
        bgColor='#28a745'
        textColor='#fff'
        text='Зарегистрироваться'
      />

      <Button
        onClick={() => navigate('/login')}
        bgColor={THEME.color.grey}
        textColor='#fff'
        text='Вернуться к входу'
      />
    </div>
  );
};

export default RegisterScreen;