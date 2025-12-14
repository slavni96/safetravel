import { useRef, useState, type FormEvent } from 'react'
import Icon from '../atoms/Icon'

type HeaderBarProps = {
  query: string
  onQueryChange: (value: string) => void
  onSearch: (value: string) => void
  suggestions: string[]
}

const HeaderBar = ({ query, onQueryChange, onSearch, suggestions }: HeaderBarProps) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      const next = !prev
      if (!prev && next) {
        requestAnimationFrame(() => inputRef.current?.focus())
        setSuggestionsOpen(true)
      } else {
        setSuggestionsOpen(false)
      }
      return next
    })
  }

  const filtered = suggestions
    .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(query)
    setSuggestionsOpen(false)
  }

  const handleSuggestionSelect = (name: string) => {
    onQueryChange(name)
    setSuggestionsOpen(false)
    setSearchOpen(false)
    inputRef.current?.blur()
    onSearch(name)
  }

  const headerClass = `header-main glass ${searchOpen ? 'searching' : ''}`

  return (
    <header className="header-shell">
      <div className={headerClass}>
        <button className="header-brand" aria-label="safetravel">
          <div className="brand-icon">
            <Icon name="plane" className="text-lg" />
          </div>
          <div>
            <p className="eyebrow brand-overline">Safetravel</p>
            <p className="brand-title">Navigate the world</p>
          </div>
        </button>
        <div className="header-actions">
          <form
            className={`search-inline ${searchOpen ? 'open' : ''}`}
            onSubmit={handleSubmit}
            role="search"
            onFocus={() => setSuggestionsOpen(true)}
          >
            <button
              type="button"
              className="search-trigger"
              aria-label="Search country"
              onClick={toggleSearch}
            >
              <Icon name="search" className="text-lg" />
            </button>
            <input
              ref={inputRef}
              className="search-inline__input"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Search a country"
              aria-label="Search a country"
            />
            {searchOpen && suggestionsOpen && filtered.length > 0 ? (
              <div className="suggestions">
                {filtered.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="suggestion-item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionSelect(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ) : null}
          </form>
          <a
            href="https://github.com/slavni96/safetravel"
            className="icon-button"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.93 0 1.39-.01 2.52-.01 2.87 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}

export default HeaderBar
