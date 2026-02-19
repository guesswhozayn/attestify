import React from 'react';
import { Search, X } from 'lucide-react';
import Button from './Button';

const SearchBar = ({ value, onChange, onClear, placeholder = "Search..." }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 text-white pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />
        <Button
          onClick={onClear}
          variant="ghost"
          rounded="full"
          size="sm"
          className="absolute right-3 top-1/2 -translate-y-1/2 !p-1 text-gray-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
    </div>
  );
};

export default SearchBar;
