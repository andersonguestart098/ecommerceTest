import React from 'react';
import { AppBar, Toolbar, IconButton, Button, Box, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Navbar: React.FC = () => {
    return (
        <AppBar 
            position="static" 
            sx={{ 
                backgroundColor: '#fff', 
                color: '#000', 
                boxShadow: 'none', 
                padding: '0 20px', 
                height: '60px'
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '70px' }}> {/* Centralizar itens */}
                {/* Logo ajustada */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/produtos/logos/" alt="Logo" style={{ height: '70px' }} /> {/* Altura da logo ajustada */}
                </Box>

                {/* Barra de busca */}
                <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#FAF8F1', borderRadius: '4px', padding: '4px 8px', flexGrow: 1, maxWidth: '400px', margin: '0 auto' }}>
                    <InputBase placeholder="Buscar produtos" sx={{ ml: 1, flex: 1 }} />
                    <IconButton type="submit" aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Box>

                {/* Botões Login e Carrinho */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button sx={{color: '#313926'}}>Login</Button>
                    <IconButton edge="end" color="inherit" aria-label="cart">
                        <ShoppingCartIcon sx={{color: '#313926'}}/>
                        <span>2</span> {/* Exemploss de quantidade de itens */}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
