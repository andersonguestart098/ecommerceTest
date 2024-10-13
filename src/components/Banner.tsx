import React, { useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

interface BannerProps {
  images: {
    imageUrl: string;
  }[];
}

const Banner: React.FC<BannerProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  const handleNext = () => {
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      setIsSliding(false);
    }, 500); // Tempo da animação de slide
  };

  const handlePrevious = () => {
    setIsSliding(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
      setIsSliding(false);
    }, 500); // Tempo da animação de slide
  };

  // Função para trocar automaticamente as imagens a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(handleNext, 5000); // Troca a cada 5 segundos
    return () => clearInterval(interval); // Limpa o intervalo quando o componente desmonta
  }, [images]);

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
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease-in-out', // Suave transição de slide
              transform: isSliding ? 'translateX(-100%)' : 'translateX(0)',
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
