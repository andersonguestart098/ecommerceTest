import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DiscountIcon from '@mui/icons-material/Discount';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const InfoSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#FAF8F1',
        padding: '10px 0', // Controlando o padding para manter a altura
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        height: '60px', // Altura fixa que você especificou
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        {/* Frete Grátis */}
        <Grid item xs={12} sm={3} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <LocalShippingIcon sx={{ fontSize: 29, color: '#313926' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 14, color: '#313926' }}>
            Frete Grátis
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12, color: '#313926' }}>
            Consulte o Regulamento
          </Typography>
        </Grid>

        {/* Parcelamento */}
        <Grid item xs={12} sm={3} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CreditCardIcon sx={{ fontSize: 29, color: '#313926' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 14, color: '#313926' }}>
            Parcelamento em até 11x
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12, color: '#313926' }}>
            No Cartão de Crédito
          </Typography>
        </Grid>

        {/* Desconto */}
        <Grid item xs={12} sm={3} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <DiscountIcon sx={{ fontSize: 29, color: '#313926' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 14, color: '#313926' }}>
            7% de Desconto
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12, color: '#313926' }}>
            À Vista no Pix
          </Typography>
        </Grid>

        {/* Devolução e Garantia */}
        <Grid item xs={12} sm={3} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <VerifiedUserIcon sx={{ fontSize: 29, color: '#313926' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 14, color: '#313926' }}>
            Devolução e Garantia
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12, color: '#313926' }}>
            7 Dias para Devolver sem Custo
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InfoSection;
