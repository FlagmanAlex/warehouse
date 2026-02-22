import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../api/fetchApi'; // ← путь подправь под свою структуру
import { useAuth } from '../../Screens/AuthScreen/AuthContext'; // ← если используешь контекст
import { TextField } from '../../../shared/TextFields';
import style from './LoginScreen.module.css';
import { Button } from '../../../shared/Button';
import { THEME } from '@warehouse/config';
import type { ResponseUserDto } from '@warehouse/interfaces/DTO';

// Если у тебя есть кастомный Button — импортируй его
// import { Button } from '../../../shared/Button';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

    const handleLogin = async () => {
    if (!email || !password) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response: ResponseUserDto = await fetchApi('auth/login', 'POST', { email, password });
      await login(response.token, response.user); // сохраняет токен в localStorage и устанавливает состояние авторизации

      // Перенаправляем на главную или другую защищённую страницу
      navigate('/', { replace: true });
    } catch (error) {
      alert('Неверный логин или пароль');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
  
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    }
  }, [handleLogin])
  


  return (
    <div className={style.loginContainer}>
      <h1 className={style.loginTitle}>Авторизация</h1>

      <TextField
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        type="password"
        name="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        onClick={handleLogin}
        bgColor='#28a745'
        textColor={THEME.color.white}
        text='Войти'
      />

      {/* <Button
        onClick={() => navigate('/register')}
        bgColor={THEME.color.grey}
        textColor={THEME.color.white}
        text='Зарегистрироваться'
      /> */}
    </div>
  );
};

export default LoginScreen;