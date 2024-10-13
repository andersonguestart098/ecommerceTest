import React, { useState } from 'react';
import { Box, Button, Typography, Input } from '@mui/material';
import axios from 'axios';

const BannerUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file)); // Pré-visualizar a imagem
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Por favor, selecione um arquivo antes de fazer o upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://localhost:3001/banners/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Imagem enviada com sucesso:', response.data.secure_url);
            alert('Imagem enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            alert('Erro ao enviar imagem');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">Upload de Banner</Typography>
            <Input type="file" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Pré-visualização" style={{ maxWidth: '100%', height: 'auto' }} />}
            <Button variant="contained" color="primary" onClick={handleUpload}>
                Fazer Upload
            </Button>
        </Box>
    );
};

export default BannerUpload;
