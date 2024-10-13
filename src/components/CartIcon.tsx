import React from 'react';
import { Badge, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartIcon: React.FC = () => {
  const itemCount = 2; // Exemplo de quantidade de itens no carrinho

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Badge badgeContent={itemCount} color="secondary">
        <ShoppingCartIcon sx={{ fontSize: 30, color: '#313926' }} />
      </Badge>
    </Box>
  );
};

export default CartIcon;
