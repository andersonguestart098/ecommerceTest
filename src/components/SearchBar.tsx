import React, { useState } from "react";
import { Box, TextField, Button, IconButton, Collapse, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  onSearch: (searchTerm: string, color: string, minPrice: number | "", maxPrice: number | "") => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(searchTerm, color, minPrice, maxPrice);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      <TextField
        placeholder="Buscar produtos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        variant="outlined" // Use outlined para ajustar a borda
        sx={{
          flexGrow: 1,
          backgroundColor: "#E6E3DB", // Light color for the input background
          borderRadius: "20px", // Rounder edges
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: "none", // Remove a borda do input
            },
          },
        }}
      />

      <IconButton
        onClick={() => setShowFilters((prev) => !prev)}
        aria-label="search"
        sx={{
          color: "#313926",
          transition: "transform 0.3s ease",
          '&:hover': {
            transform: "scale(1.1)", // Animation on hover
          },
        }}
      >
        <SearchIcon />
      </IconButton>
      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <Box sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: 'white',
          boxShadow: 3,
          padding: 2,
          borderRadius: 1,
          zIndex: 1000, // Ensure it appears on top
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
          width: '100%'
        }}>
          <TextField
            placeholder="Cor (ex: azul)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <TextField
            placeholder="Preço mínimo"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : "")}
            size="small"
          />
          <TextField
            placeholder="Preço máximo"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : "")}
            size="small"
          />
          <Button variant="contained" onClick={handleSearch} sx={{backgroundColor: '#313926'}}>Buscar</Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default SearchBar;
