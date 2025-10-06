import s from './Button.module.css'
import { Icon, type IconName } from '../../Icon'

interface ButtonProps {
  text?: string // ReactNode
  bgColor?: string          // backgroundColor
  bdColor?: string          // borderColor
  textColor?: string        // textColor
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
  icon?: IconName | null
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  value?: string
  name?: string
}

export const Button = ({ text, onClick=() => {}, bgColor, textColor, bdColor, className, icon = null, disabled = false, type = 'button', value, name }: ButtonProps) => {
  return (
    <>
      <button type={type} className={`${s.Button} ${className} ${disabled ? s.disabled : ''}`}
        onClick={onClick}
        style={{ backgroundColor: bgColor, color: textColor, borderColor: bdColor }}
        value={value}
        name={name}
        disabled={disabled}
      >
        {icon && <Icon name={icon} size={20} />}
        {text}
      </button>
    </>
  )
}
