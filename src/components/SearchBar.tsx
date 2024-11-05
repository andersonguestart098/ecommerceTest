import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Collapse,
  useMediaQuery,
  InputAdornment,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme } from "@mui/material/styles";

interface SearchBarProps {
  onSearch: (
    searchTerm: string,
    color: string,
    minPrice: number | "",
    maxPrice: number | ""
  ) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const filterRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = () => {
    onSearch(searchTerm, color, minPrice, maxPrice);
    window.scrollTo({
      top: 500, // Ajuste este valor conforme necessário para controlar o scroll
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("", "", "", ""); // Reseta a busca
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <TextField
        placeholder="Buscar produtos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
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
          endAdornment: (
            <InputAdornment position="end">
              {searchTerm && (
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon sx={{ color: "#313926", fontSize: "1rem" }} />
                </IconButton>
              )}
              <IconButton onClick={handleSearch} size="small">
                <SearchIcon sx={{ color: "#313926" }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Exibir botão de filtros apenas no desktop */}
      {!isMobile && (
        <Collapse in={showFilters} timeout="auto" unmountOnExit>
          <Box
            ref={filterRef}
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
            {/* Filtros de preço mínimo e máximo */}
            <TextField
              placeholder="Preço mínimo"
              type="number"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value ? parseFloat(e.target.value) : "")
              }
              size="small"
            />
            <TextField
              placeholder="Preço máximo"
              type="number"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value ? parseFloat(e.target.value) : "")
              }
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ backgroundColor: "#313926" }}
            >
              Buscar
            </Button>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default SearchBar;
