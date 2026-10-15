import { forwardRef } from 'react';
import { CloseIcon, SearchIcon } from './Icons.jsx';

/** Labeled search field with a clear control. Results update as you type. */
const SearchForm = forwardRef(function SearchForm({ value, onChange, onClear }, inputRef) {
  return (
    <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="search-input" className="search-form__label">
        Search titles, people and genres
      </label>
      <div className="search-form__field">
        <SearchIcon size={24} className="search-form__icon" />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          className="search-form__input"
          placeholder="Titles, people, genres"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && value) {
              e.preventDefault();
              onClear();
            }
          }}
          autoComplete="off"
          spellCheck="false"
          enterKeyHint="search"
        />
        {value && (
          <button type="button" className="search-form__clear" onClick={onClear} aria-label="Clear search">
            <CloseIcon size={20} />
          </button>
        )}
      </div>
    </form>
  );
});

export default SearchForm;
