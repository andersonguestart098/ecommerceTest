import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    cardholderName: "",
    installments: 1,
  });
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;

  useEffect(() => {
    const checkoutData = localStorage.getItem("checkoutData");
    const parsedData = checkoutData
      ? JSON.parse(checkoutData)
      : { amount: 100.5 };

    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    const initializeMercadoPago = () => {
      const mp = new (window as any).MercadoPago(publicKey, {
        locale: "pt-BR",
      });

      const cardForm = mp.cardForm({
        amount: String(parsedData.amount),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número do cartão",
          },
          expirationDate: {
            id: "form-checkout__expirationDate",
            placeholder: "MM/YY",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "Código de segurança",
          },
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Titular do cartão",
          },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Parcelas",
          },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error)
              return console.warn("Erro ao montar o formulário: ", error);
            setIsMpReady(true);
          },
          onPaymentMethodsReceived: (error: any, paymentMethods: any) => {
            if (error) {
              console.error("Erro ao obter métodos de pagamento:", error);
              return;
            }

            if (paymentMethods && paymentMethods[0]?.payer_costs) {
              const installmentOptions = paymentMethods[0].payer_costs
                .filter((option: any) => option.installments <= 12) // Limita até 12x
                .map((option: any) => option.installments);
              setInstallmentOptions(installmentOptions);
            } else {
              alert("Nenhuma opção de parcelamento disponível.");
            }
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            const formData = cardForm.getCardFormData();

            if (!formData.amount || Number(formData.amount) <= 0) {
              alert("Erro: valor do pagamento é inválido.");
              return;
            }

            const paymentData = {
              token: formData.token,
              issuer_id: formData.issuerId,
              payment_method_id: formData.paymentMethodId,
              transaction_amount: Number(formData.amount),
              installments: Number(formData.installments),
              description: "Descrição do produto",
              payer: {
                email: formData.cardholderEmail,
                identification: {
                  type: formData.identificationType,
                  number: formData.identificationNumber,
                },
              },
            };

            try {
              const response = await axios.post(
                "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
                paymentData
              );

              if (response.data.status === "approved") {
                navigate("/sucesso");
              } else {
                alert("Pagamento pendente ou falhou. Verifique a transação.");
              }
            } catch (error) {
              alert("Erro ao finalizar o pagamento.");
            }
          },
        },
      });
    };

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = initializeMercadoPago;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [publicKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  return (
    <Box
      sx={{
        padding: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Pagamento
      </Typography>

      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: 2,
          width: "300px",
          marginBottom: 3,
          textAlign: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography variant="h6">
          {cardDetails.cardNumber || "**** **** **** ****"}
        </Typography>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="body2">
            {cardDetails.expirationDate || "MM/YY"}
          </Typography>
          <Typography variant="body2">
            {cardDetails.cardholderName || "Nome do Titular"}
          </Typography>
        </Box>
      </Box>

      <form id="form-checkout" style={{ width: "100%", maxWidth: 400 }}>
        <TextField
          fullWidth
          label="Número do Cartão"
          id="form-checkout__cardNumber"
          name="cardNumber"
          placeholder="Número do cartão"
          value={cardDetails.cardNumber}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Data de Expiração"
            id="form-checkout__expirationDate"
            name="expirationDate"
            placeholder="MM/YY"
            value={cardDetails.expirationDate}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Código de Segurança"
            id="form-checkout__securityCode"
            name="securityCode"
            placeholder="123"
            value={cardDetails.securityCode}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
        </Box>
        <TextField
          fullWidth
          label="Titular do Cartão"
          id="form-checkout__cardholderName"
          name="cardholderName"
          placeholder="Nome do titular"
          value={cardDetails.cardholderName}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel>Parcelas</InputLabel>
          <Select
            label="Parcelas"
            id="form-checkout__installments"
            value={cardDetails.installments}
            onChange={(e) =>
              setCardDetails({
                ...cardDetails,
                installments: Number(e.target.value),
              })
            }
          >
            {installmentOptions.map((installment) => (
              <MenuItem key={installment} value={installment}>
                {installment}x
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!isMpReady}
        >
          PAGAR
        </Button>
      </form>
    </Box>
  );
};

export default Checkout;
