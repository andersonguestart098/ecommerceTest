import React, { useState } from "react";

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Lógica para buscar produtos
  };

  return (
    <input
      type="text"
      placeholder="Buscar produtos..."
      value={searchTerm}
      onChange={handleSearch}
    />
  );
};

export default SearchBar;
