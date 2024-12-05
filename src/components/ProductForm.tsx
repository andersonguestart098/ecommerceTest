import React, { useState } from "react";
import { TextField, Button, Box, Typography, Avatar } from "@mui/material";
import axios from "axios";

const ProductForm: React.FC = () => {
  const [name, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [discount, setDiscount] = useState<number | string>("");
  const [paymentOptions, setPaymentOptions] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [colorData, setColorData] = useState<
    {
      colorName: string;
      colorFile: File | null;
      imageRefIndex: number | null;
    }[]
  >([]);
  const [metersPerBox, setMetersPerBox] = useState<number | string>("");
  const [weightPerBox, setWeightPerBox] = useState<number | string>("");
  const [boxDimensions, setBoxDimensions] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [freightClass, setFreightClass] = useState<number | string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação para garantir que todos os campos obrigatórios estejam preenchidos
    if (colorData.some((color) => !color.colorName || !color.colorFile)) {
      alert(
        "Certifique-se de preencher todos os campos de nome e imagem para as cores."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price as string);
    formData.append("discount", discount as string);
    formData.append(
      "paymentOptions",
      JSON.stringify(paymentOptions.split(","))
    ); // Enviar como array de strings
    formData.append("metersPerBox", metersPerBox as string);
    formData.append("weightPerBox", weightPerBox as string);
    formData.append("boxDimensions", boxDimensions);
    formData.append("materialType", materialType);
    formData.append("freightClass", freightClass as string);

    // Adicionando imagens principais
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Adicionando imagens de cores e seus respectivos nomes e referências
    colorData.forEach(({ colorName, colorFile }, index) => {
      formData.append("colorNames", colorName); // Nome da cor
      formData.append("imageRefIndexes", String(index)); // Índice da imagem principal
      if (colorFile) {
        formData.append("colors", colorFile); // Arquivo da cor
      }
    });

    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Produto criado com sucesso!");
      console.log("Resposta do backend:", response.data);

      // Resetar campos do formulário
      setTitle("");
      setDescription("");
      setPrice("");
      setDiscount("");
      setPaymentOptions("");
      setImageFiles([]);
      setColorData([]);
      setMetersPerBox("");
      setWeightPerBox("");
      setBoxDimensions("");
      setMaterialType("");
      setFreightClass("");
    } catch (error: any) {
      console.error("Erro ao criar produto:", error.response?.data || error);
      alert(
        `Erro ao criar produto: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleAddColor = () => {
    setColorData([
      ...colorData,
      { colorName: "", colorFile: null, imageRefIndex: null },
    ]);
  };

  const handleColorNameChange = (index: number, value: string) => {
    const updatedColors = [...colorData];
    updatedColors[index].colorName = value;
    setColorData(updatedColors);
  };

  const handleColorFileChange = (index: number, file: File | null) => {
    const updatedColors = [...colorData];
    updatedColors[index].colorFile = file;
    setColorData(updatedColors);
  };

  const handleImageRefChange = (index: number, value: string) => {
    const updatedColors = [...colorData];
    updatedColors[index].imageRefIndex = parseInt(value, 10);
    setColorData(updatedColors);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 600,
        margin: "auto",
        mt: 5,
      }}
    >
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
      <TextField
        label="Metros por Caixa"
        type="number"
        value={metersPerBox}
        onChange={(e) => setMetersPerBox(e.target.value)}
        required
      />
      <TextField
        label="Peso por Caixa (kg)"
        type="number"
        value={weightPerBox}
        onChange={(e) => setWeightPerBox(e.target.value)}
        required
      />
      <TextField
        label="Dimensões da Caixa (LxAxC)"
        value={boxDimensions}
        onChange={(e) => setBoxDimensions(e.target.value)}
        required
      />
      <TextField
        label="Tipo de Material"
        value={materialType}
        onChange={(e) => setMaterialType(e.target.value)}
        required
      />
      <TextField
        label="Classe de Frete"
        type="number"
        value={freightClass}
        onChange={(e) => setFreightClass(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        name="images"
        required
      />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Imagens principais ({imageFiles.length})
      </Typography>
      {imageFiles.map((file, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={URL.createObjectURL(file)}
            alt={`Imagem ${index + 1}`}
            sx={{ width: 80, height: 80 }}
          />
          <Typography>{file.name}</Typography>
        </Box>
      ))}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleAddColor}
        sx={{ mt: 2 }}
      >
        Adicionar Cor
      </Button>

      {colorData.map((color, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 2,
          }}
        >
          <TextField
            label={`Nome da Cor ${index + 1}`}
            value={color.colorName}
            onChange={(e) => handleColorNameChange(index, e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleColorFileChange(
                index,
                e.target.files ? e.target.files[0] : null
              )
            }
            required
          />
          <TextField
            select
            label="Imagem Principal Referente"
            value={color.imageRefIndex ?? ""}
            onChange={(e) => handleImageRefChange(index, e.target.value)}
            SelectProps={{ native: true }}
            required
          >
            <option value="">Selecione uma imagem</option>
            {imageFiles.map((_, imgIndex) => (
              <option key={imgIndex} value={imgIndex}>
                Imagem {imgIndex + 1}
              </option>
            ))}
          </TextField>
        </Box>
      ))}

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Criar Produto
      </Button>
    </Box>
  );
};

export default ProductForm;
