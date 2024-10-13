import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

const ProductForm: React.FC = () => {
    const [name, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [discount, setDiscount] = useState<number | string>(''); 
    const [paymentOptions, setPaymentOptions] = useState(''); 
    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [colorFiles, setColorFiles] = useState<File[]>([]); 
    const [colorNames, setColorNames] = useState<string[]>([]); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Verificar se o número de imagens de cores corresponde ao número de nomes
        if (colorFiles.length === 0 || colorNames.length === 0 || colorFiles.length !== colorNames.length) {
            alert("O número de imagens de cores e nomes deve ser igual e não pode ser vazio.");
            return;
        }
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price as string);
        formData.append('discount', discount as string); 
        formData.append('paymentOptions', paymentOptions);
    
        if (imageFile) {
            formData.append('image', imageFile); // Certifique-se de usar 'image' como nome do campo
        }
    
        // Adicionar as imagens de cores como 'colors'
        colorFiles.forEach((file) => {
            console.log(`Adicionando imagem de cor: ${file.name}`); // Adiciona um log para verificar
            formData.append('colors', file); // Nome deve coincidir com o esperado no backend
        });
    
        // Adicionar os nomes das cores como 'colorNames'
        colorNames.forEach((name) => {
            console.log(`Adicionando nome da cor: ${name}`); // Adiciona um log para verificar
            formData.append('colorNames', name); // Nome para enviar o array de nomes das cores
        });
    
        // Exibir os dados do FormData antes do envio para depuração
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
    
        try {
            const response = await axios.post('http://localhost:3001/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Produto criado com sucesso!');
            console.log("Resposta do backend: ", response.data);
    
            // Limpar campos após o envio
            setTitle('');
            setDescription('');
            setPrice('');
            setDiscount(''); 
            setPaymentOptions(''); 
            setImageFile(null);
            setColorFiles([]);
            setColorNames([]);
        } catch (error: any) {
            console.error('Erro ao criar produto:', error.response?.data || error);
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleColorImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setColorFiles(Array.from(e.target.files)); 
        }
    };

    const handleColorNamesChange = (index: number, value: string) => {
        const updatedNames = [...colorNames];
        updatedNames[index] = value;
        setColorNames(updatedNames);
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
                onChange={(e) => setDiscount(e.target.value)} 
                required
            />
            <TextField
                label="Opções de Pagamento (separadas por vírgula)" 
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

            {/* Campo para selecionar imagens de cores */}
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleColorImagesChange}
            />

            {/* Campos para adicionar os nomes das cores */}
            {colorFiles.map((file, index) => (
                <TextField
                    key={index}
                    label={`Nome da Cor ${index + 1}`}
                    value={colorNames[index] || ''}
                    onChange={(e) => handleColorNamesChange(index, e.target.value)}
                    required
                />
            ))}

            <Button type="submit" variant="contained" color="primary">
                Criar Produto
            </Button>
        </Box>
    );
};

export default ProductForm;
