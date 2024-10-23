import React from 'react';
import { Container } from '@mui/material';
import Banner from '../components/Banner';
import InfoSection from '../components/InfoSection';
import BrandsSection from '../components/BrandsSection';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

// Defining the type for the props
interface HomePageProps {
  images: {
    imageUrl: string;
  }[];
  filters: {
    searchTerm: string;
    color: string;
    minPrice: string;
    maxPrice: string;
  };
}

const HomePage: React.FC<HomePageProps> = ({ images, filters }) => {
  return (
    <div className="home-page">
      {images.length > 0 ? (
        <Banner images={images} />
      ) : (
        <div></div>
      )}
      <InfoSection />
      <BrandsSection />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ProductList {...filters} />
        
      </Container>
    </div>
  );
};

export default HomePage;
