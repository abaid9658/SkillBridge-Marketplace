import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = 'Search for services...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-sm)',
        padding: '2px 8px 2px 16px',
        width: '100%',
        maxWidth: '500px',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
      }}
      className="search-bar-container"
    >
      <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: '15px',
          color: 'var(--text-primary)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        className="btn btn-primary"
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '4px',
          marginLeft: '8px',
        }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
