import React, { useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, CardActions, Box, Avatar } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        image: string;
        discount: number;
        paymentOptions: string[];
        colors: { name: string; image: string }[];  // Array de cores
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { name, description, price, discount, paymentOptions, image, colors } = product;

    useEffect(() => {
        console.log('Produto:', product);
        console.log('Cores recebidas:', colors);  // Verifica se as cores estão chegando corretamente
    }, [product, colors]);

    // Calculando o preço com desconto
    const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

    return (
        <Card sx={{ maxWidth: 375, border: '2.32px solid #FAF8F1', boxShadow: 'none' }}>
            <CardMedia
                component="img"
                height="240"
                image={image}
                alt={name}
            />

            <CardContent>
                <Typography gutterBottom variant="h5" component="div" sx={{ color: '#313926' }}>
                    {name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>

                {discount > 0 && (
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: '#313926' }}>
                        R$ {price.toFixed(2)}
                    </Typography>
                )}

                <Typography variant="h6" sx={{ color: '#AE9C82', marginBottom: '8px' }}>
                    R$ {finalPrice.toFixed(2)}
                </Typography>

                {/* Exibindo as opções de pagamento */}
                <div style={{ color: '#313926', marginTop: '10px' }}>
                    {paymentOptions.map((option, index) => (
                        <Typography variant="body2" key={index} sx={{ margin: '2px 0' }}>
                            {option}
                        </Typography>
                    ))}
                </div>

                {/* Exibindo as opções de cores sem paginação */}
                <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {colors && colors.length > 0 ? (
                        colors.map((color, index) => (
                            <Box key={index} sx={{ textAlign: 'center' }}>
                                <Avatar
                                    alt={color.name}
                                    src={color.image}
                                    sx={{ margin: 'auto', width: 56, height: 56 }}
                                />
                                <Typography>{color.name}</Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="caption">Nenhuma cor disponível</Typography>
                    )}
                </Box>
            </CardContent>

            <CardActions>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCartIcon />}
                    sx={{ backgroundColor: '#313926' }}
                >
                    Adicionar
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProductCard;
