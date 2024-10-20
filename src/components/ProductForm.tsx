// Código de envio no formulário de produto
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

const ProductForm: React.FC = () => {
    const [name, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [discount, setDiscount] = useState<number | string>(''); 
    const [paymentOptions, setPaymentOptions] = useState(''); 
    const [imageFiles, setImageFiles] = useState<File[]>([]); 
    const [colorFiles, setColorFiles] = useState<File[]>([]); 
    const [colorNames, setColorNames] = useState<string[]>([]); 
    const [metersPerBox, setMetersPerBox] = useState<number | string>('');
    const [weightPerBox, setWeightPerBox] = useState<number | string>('');
    const [boxDimensions, setBoxDimensions] = useState('');
    const [materialType, setMaterialType] = useState('');
    const [freightClass, setFreightClass] = useState<number | string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
        formData.append('metersPerBox', metersPerBox as string);
        formData.append('weightPerBox', weightPerBox as string);
        formData.append('boxDimensions', boxDimensions);
        formData.append('materialType', materialType);
        formData.append('freightClass', freightClass as string);

        // Adicionando várias imagens principais
        imageFiles.forEach((file) => {
            formData.append('images', file);
        });

        // Adicionando imagens de cores e nomes
        colorFiles.forEach((file) => {
            formData.append('colors', file);
        });

        colorNames.forEach((name) => {
            formData.append('colorNames', name);
        });

        try {
            const response = await axios.post('http://localhost:3001/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Produto criado com sucesso!');
            console.log("Resposta do backend: ", response.data);

            // Resetar campos do formulário
            setTitle('');
            setDescription('');
            setPrice('');
            setDiscount(''); 
            setPaymentOptions(''); 
            setImageFiles([]);
            setColorFiles([]);
            setColorNames([]);
            setMetersPerBox('');
            setWeightPerBox('');
            setBoxDimensions('');
            setMaterialType('');
            setFreightClass('');
        } catch (error: any) {
            console.error('Erro ao criar produto:', error.response?.data || error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
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
            <TextField label="Título" value={name} onChange={(e) => setTitle(e.target.value)} required />
            <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <TextField label="Preço" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <TextField label="Desconto (%)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
            <TextField label="Opções de Pagamento (separadas por vírgula)" value={paymentOptions} onChange={(e) => setPaymentOptions(e.target.value)} required />
            <TextField label="Metros por Caixa" type="number" value={metersPerBox} onChange={(e) => setMetersPerBox(e.target.value)} required />
            <TextField label="Peso por Caixa (kg)" type="number" value={weightPerBox} onChange={(e) => setWeightPerBox(e.target.value)} required />
            <TextField label="Dimensões da Caixa (LxAxC)" value={boxDimensions} onChange={(e) => setBoxDimensions(e.target.value)} required />
            <TextField label="Tipo de Material" value={materialType} onChange={(e) => setMaterialType(e.target.value)} required />
            <TextField label="Classe de Frete" type="number" value={freightClass} onChange={(e) => setFreightClass(e.target.value)} required />
            
            <input type="file" accept="image/*" multiple onChange={handleImageChange} name="images" required />
            <input type="file" accept="image/*" multiple onChange={handleColorImagesChange} name="colors" required />

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
