import React, { useState } from "react";
import { Box, TextField, Button, IconButton, Collapse, useMediaQuery, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

interface SearchBarProps {
  onSearch: (searchTerm: string, color: string, minPrice: number | "", maxPrice: number | "") => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSearchVisible, setIsSearchVisible] = useState(false);


  const handleSearch = () => {
    onSearch(searchTerm, color, minPrice, maxPrice);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
};

  return (
    <Box sx={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
      <TextField
        placeholder="Buscar produtos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          flexGrow: 1,
          backgroundColor: "#E6E3DB",
          borderRadius: "20px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { border: "none" },
          },
        }}
        InputProps={{
          endAdornment: isMobile ? (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch}>
                <SearchIcon sx={{ color: "#313926" }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Show filters button only on larger screens */}
      {!isMobile && (
        <IconButton
          onClick={() => setShowFilters((prev) => !prev)}
          aria-label="search"
          sx={{
            color: "#313926",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.1)" },
          }}
        >
          <SearchIcon />
        </IconButton>
      )}

      {!isMobile && (
        <Collapse in={showFilters} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              backgroundColor: "white",
              boxShadow: 3,
              padding: 2,
              borderRadius: 1,
              zIndex: 1000,
              display: "flex",
              gap: "10px",
              flexDirection: "column",
              width: "100%",
            }}
          >
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
            <Button variant="contained" onClick={handleSearch} sx={{ backgroundColor: "#313926" }}>
              Buscar
            </Button>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default SearchBar;
