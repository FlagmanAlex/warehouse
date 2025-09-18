import type { ReactNode } from 'react'
import s from './Button.module.css'

interface ButtonProps {
  text: string | ReactNode // ReactNode
  bgColor?: string          // backgroundColor
  bdColor?: string          // borderColor
  textColor?: string        // textColor
  onClick: () => void
  className?: string
}

export const Button = ({text, onClick, bgColor, textColor, bdColor, className}: ButtonProps) => {
  return (
    <div className={`${s.Button} ${className}`}
        onClick={onClick}
        style={{backgroundColor: bgColor, color: textColor, borderColor: bdColor}}
    >
        {text}
    </div>
  )
}
