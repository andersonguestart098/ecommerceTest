import React from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

interface BannerProps {
  images: {
    imageUrl: string;
  }[];
}

const Banner: React.FC<BannerProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: '100%',
        height: '240px', // Ajuste a altura conforme necessário
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginTop: '20px',
      }}
    >
      {images.length > 0 && (
        <>
          <Box
            component="img"
            src={images[currentIndex]?.imageUrl}
            alt="Banner"
            sx={{
              width: '100%',
              height: '100%',   // Ajustar a altura para ocupar todo o banner
              objectFit: 'cover', // Para garantir que a imagem seja ajustada ao container sem perder proporção
            }}
          />

          <IconButton onClick={handlePrevious} sx={{ position: 'absolute', top: '50%', left: '10px' }}>
            <ArrowBackIos />
          </IconButton>

          <IconButton onClick={handleNext} sx={{ position: 'absolute', top: '50%', right: '10px' }}>
            <ArrowForwardIos />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default Banner;
