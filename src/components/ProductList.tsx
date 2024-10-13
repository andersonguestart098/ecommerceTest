import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid } from '@mui/material';
import ProductCard from './ProductCard';

interface Product {
    id: string;
    name: string;  // Atualizei de title para name para ser consistente com a API
    description: string;
    price: number;
    discount: number;  // Adicionei o campo de desconto
    paymentOptions: string[];  // Adicionei o campo de opções de pagamento
    image: string;
    colors: { name: string; image: string }[]; 
}

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        axios.get('http://localhost:3001/products')
            .then(response => setProducts(response.data))
            .catch(error => console.error('Erro ao buscar produtos:', error));
    }, []);

    return (
        <Grid container spacing={3}>
            {products.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList;
