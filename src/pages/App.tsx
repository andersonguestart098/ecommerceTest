import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/CustomTheme';
import HomePage from '../pages/HomePage';
import BannerUpload from '../components/BannerUpload';
import ProductForm from '../components/ProductForm';

const App: React.FC = () => {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                console.log('Iniciando a busca de banners...');
                const response = await axios.get('http://localhost:3001/banners');
                console.log('Resposta da API de banners:', response.data);

                const formattedImages = response.data.map((resource: any) => ({
                    imageUrl: resource.imageUrl,  // Certifique-se de usar 'imageUrl'
                }));

                console.log('Imagens formatadas:', formattedImages);
                setImages(formattedImages);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar imagens de banners:', error);
                setError('Erro ao buscar imagens de banners');
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading) {
        console.log('Carregando...');
        return <div>Carregando...</div>;
    }

    if (error) {
        console.log('Erro:', error);
        return <div>{error}</div>;
    }

    console.log('Imagens recebidas no App:', images);  // Adiciona log para verificar imagens

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <HomePage images={images} />
                <ProductForm/>
                <BannerUpload />
            </div>
        </ThemeProvider>
    );
};

export default App;
