import { forwardRef, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...rest }, ref) => {
  const classes = ['input', className].filter(Boolean).join(' ')
  return <input ref={ref} className={classes} {...rest} />
})

Input.displayName = 'Input'

export default Input
