import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

const Button = ({ variant = 'primary', className = '', ...rest }: ButtonProps) => {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ')
  return <button className={classes} {...rest} />
}

export default Button
