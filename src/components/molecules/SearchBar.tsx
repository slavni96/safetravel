import type { FormEventHandler } from 'react'
import Button from '../atoms/Button'
import Input from '../atoms/Input'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  placeholder?: string
}

const SearchBar = ({ value, onChange, onSubmit, placeholder }: SearchBarProps) => (
  <form className="search" onSubmit={onSubmit}>
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Search a country"
    />
    <Button type="submit">Search</Button>
  </form>
)

export default SearchBar
