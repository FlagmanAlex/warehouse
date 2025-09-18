import * as FaIcons from 'react-icons/fa6';
import React from 'react';

// Объединяем все иконки, которые будем использовать
const iconMap = {
  ...FaIcons,
};

export type IconName = keyof typeof iconMap;
interface IconProps {
  name: IconName; // Имя иконки, например: "FaCheck", "MdFavorite"
  size?: string | number;
  color?: string;
  className?: string;
  [key: string]: any; // Для любых других пропсов (onClick и т.д.)

}

export const Icon: React.FC<IconProps> = ({ name, size = 16, color = "currentColor", ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  return <IconComponent size={size} color={color} {...props} />;
};