import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, CardActions } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Importando o ícone

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        image: string;
        discount: number;
        paymentOptions: string[]; // Agora é um array de strings
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { name, description, price, discount, paymentOptions, image } = product;

    // Calculando o preço com desconto
    const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

    return (
        <Card sx={{ maxWidth: 345, border: '2.32px solid #FAF8F1', boxShadow: 'none' }}>
            <CardMedia
                component="img"
                height="140"
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

                {discount > 0 ? (
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: '#313926' }}>
                        R$ {price.toFixed(2)}
                    </Typography>
                ) : null}
                
                <Typography variant="h6" sx={{ color: '#313926' }}>
                    R$ {finalPrice.toFixed(2)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Opções de pagamento:
                </Typography>
                <ul style={{ color: '#313926' }}>
                    {paymentOptions.map((option, index) => (
                        <li key={index}>{option}</li>
                    ))}
                </ul>
            </CardContent>
            <CardActions>
                <Button size="small" variant="contained" color="primary" startIcon={<AddShoppingCartIcon />} sx={{backgroundColor: '#313926'}}>
                    Adicionar
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProductCard;
