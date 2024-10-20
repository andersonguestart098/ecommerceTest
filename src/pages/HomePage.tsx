import React from 'react';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import ProductList from '../components/ProductList';
import { Container } from '@mui/material';
import InfoSection from '../components/InfoSection';
import BrandsSection from '../components/BrandsSection';
import ProductForm from '../components/ProductForm';

// Definindo o tipo das props
interface HomePageProps {
  images: {
    imageUrl: string;
  }[];
}

const HomePage: React.FC<HomePageProps> = ({ images }) => {
  console.log('Imagens recebidas no HomePage:', images);  // Log para verificar as imagens no componente

  return (
    <div className="home-page">
    
      
      {images.length > 0 ? (
        <Banner images={images} />
      ) : (
        <div>Nenhum banner disponível</div>
      )}
    <InfoSection />
    <BrandsSection />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ProductList />
        <ProductForm/>
      </Container>
    </div>
  );
};

export default HomePage;
