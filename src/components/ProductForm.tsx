import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

const ProductForm: React.FC = () => {
    const [name, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [discount, setDiscount] = useState<number | string>(''); // Campo de desconto
    const [paymentOptions, setPaymentOptions] = useState(''); // Novo campo de opções de pagamento
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price as string);
        formData.append('discount', discount as string); // Adicionando o campo de desconto
        formData.append('paymentOptions', paymentOptions); // Adicionando o campo de opções de pagamento
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            await axios.post('http://localhost:3001/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Produto criado com sucesso!');
            setTitle('');
            setDescription('');
            setPrice('');
            setDiscount(''); // Limpar o desconto após o envio
            setPaymentOptions(''); // Limpar o campo de opções de pagamento
            setImageFile(null);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, margin: 'auto', mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Registrar Novo Produto
            </Typography>
            <TextField
                label="Título"
                value={name}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <TextField
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <TextField
                label="Preço"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            <TextField
                label="Desconto (%)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)} // Adiciona o campo de desconto
                required
            />
            <TextField
                label="Opções de Pagamento (separadas por vírgula)" // Adiciona o campo de opções de pagamento
                value={paymentOptions}
                onChange={(e) => setPaymentOptions(e.target.value)}
                required
            />
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
            />
            <Button type="submit" variant="contained" color="primary">
                Criar Produto
            </Button>
        </Box>
    );
};

export default ProductForm;
