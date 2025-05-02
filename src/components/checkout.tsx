import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useCart } from "../contexts/CartContext"; // Certifique-se de ajustar o caminho

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { handleOrderCompletion } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isMpReady, setIsMpReady] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<any>(null);
  const [freightCost, setFreightCost] = useState<number>(0);
  const [isLoadingFreight, setIsLoadingFreight] = useState(false);
  const [freightOptions, setFreightOptions] = useState<any[]>([]);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;

  // Função para calcular o total do pedido
  const calculateTotal = () => {
    if (!checkoutData) return "0.00";

    const amount = parseFloat(checkoutData.amount || "0") || 0;
    const shippingCost = freightCost || 0;
    const discount = parseFloat(checkoutData.discount || "0") || 0;

    let totalAmount = amount + shippingCost - discount;
    if (paymentMethod === "pix") totalAmount *= 0.95; // Desconto de 5% para Pix

    return Math.max(totalAmount, 0).toFixed(2);
  };

  // Função consolidada para inicializar o checkout
  const initializeCheckout = async () => {
    try {
      const storedCheckoutData = localStorage.getItem("checkoutData");
      if (!storedCheckoutData) {
        alert("Dados do pedido não encontrados.");
        navigate("/cart");
        return;
      }

      const parsedCheckoutData = JSON.parse(storedCheckoutData);
      setCheckoutData(parsedCheckoutData);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você precisa estar logado para finalizar o pedido.");
        navigate("/login");
        return;
      }

      const userResponse = await axios.get(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = userResponse.data;
      if (!user.address || !user.address.postalCode) {
        alert("Nenhum endereço cadastrado. Atualize seus dados.");
        navigate("/meus-dados");
        return;
      }

      setUserAddress(user.address);

      setIsLoadingFreight(true);
      const freightPayload = {
        cepOrigem: "90200290",
        cepDestino: user.address.postalCode.replace(/\s+/g, ""),
        products: parsedCheckoutData.items.map((item: any) => ({
          productId: item.productId.split("-")[0],
          quantity: item.quantity,
        })),
      };

      const freightResponse = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/shipping/calculate",
        freightPayload
      );

      const jadlogOptions = freightResponse.data.shippingOptions.filter(
        (option: any) => option.company.name.toLowerCase().includes("jadlog")
      );

      if (jadlogOptions.length > 0) {
        setFreightOptions(jadlogOptions);
        setFreightCost(Number(jadlogOptions[0].price));
      } else {
        setFreightOptions([]);
        setFreightCost(0);
      }
    } catch (error) {
      console.error("Erro ao inicializar checkout:", error);
      alert("Erro ao carregar os dados do pedido.");
      navigate("/cart");
    } finally {
      setIsLoadingFreight(false);
    }
  };

  // Hook para inicializar o checkout apenas uma vez no carregamento
  useEffect(() => {
    initializeCheckout();
  }, [navigate]);

  // Hook para carregar o SDK do Mercado Pago apenas quando necessário
useEffect(() => {
  if (paymentMethod !== "card" || !checkoutData || !publicKey) {
    setIsMpReady(false);
    return;
  }

  // Disparar evento de conversão do Google Ads
  if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
    window.gtag("event", "conversion", {
      send_to: "AW-17032473472/ZLo_CiP_t8AaEIlDX27k_",
      value: 1.0,
      currency: "BRL"
    });
  }

  const loadMercadoPago = async () => {
    setIsLoading(true);
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      const mp = new (window as any).MercadoPago(publicKey, { locale: "pt-BR" });
      mp.cardForm({
        amount: calculateTotal(),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do Cartão" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/AA" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "CVV" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome do Titular" },
          issuer: { id: "form-checkout__issuer" },
          installments: { id: "form-checkout__installments" },
          identificationType: { id: "form-checkout__identificationType" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "CPF" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "E-mail" },
        },
        callbacks: {
          onFormMounted: (error: any) => error ? console.warn(error) : setIsMpReady(true),
          onSubmit: (event: any) => {
            event.preventDefault();
            const formData = mp.cardForm().getCardFormData();
            if (formData) handleCardPayment(formData);
          },
        },
      });
      setIsLoading(false);
    };
    document.body.appendChild(script);
  };

  loadMercadoPago();

  return () => {
    const script = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
    if (script) script.remove();
  };
}, [paymentMethod, checkoutData, publicKey]);


  // Função para processar pagamento com cartão
  const handleCardPayment = async (formData: any) => {
    try {
      const paymentData = {
        token: formData.token,
        issuer_id: formData.issuerId,
        payment_method_id: formData.paymentMethodId,
        transaction_amount: parseFloat(calculateTotal()),
        installments: selectedInstallment,
        description: "Compra em Nato Pisos",
        payer: {
          email: formData.cardholderEmail,
          first_name: formData.cardholderName.split(" ")[0],
          last_name: formData.cardholderName.split(" ").slice(1).join(" ") || "N/A",
          identification: { type: formData.identificationType, number: formData.identificationNumber },
        },
        products: checkoutData.items.map((item: any) => ({
          productId: item.productId.split("-")[0],
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
        })),
        userId: checkoutData.userId,
      };

      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        paymentData
      );

      if (response.data.status === "approved") {
        if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
          window.gtag("event", "conversion", {
            send_to: "AW-17032473472/ZLo_CiP_t8AaEIlDX27k_",
            value: parseFloat(calculateTotal()),
            currency: "BRL",
          });
        }
      
        handleOrderCompletion();
        navigate("/sucesso", { state: { paymentMethod: "card" } });
      }
      
       else {
        alert("Pagamento não aprovado.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar o pagamento.");
    }
  };

  const generatePixQrCode = async () => {
    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          payment_method_id: "pix",
          transaction_amount: parseFloat(calculateTotal()),
          description: "Pagamento via Pix",
          payer: {
            email: checkoutData.email,
            first_name: checkoutData.firstName,
            last_name: checkoutData.lastName,
            identification: { type: "CPF", number: checkoutData.cpf },
          },
          userId: checkoutData.userId,
          products: checkoutData.items.map((item: any) => ({
            productId: item.productId.split("-")[0],
            title: item.title || "Produto",
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
          })),
        }
      );
  
      const { qr_code } = response.data; // só pega o código copia e cola
  
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
        window.gtag("event", "conversion", {
          send_to: "AW-17032473472/ZLo_CiP_t8AaEIlDX27k_",
          value: 1.0,
          currency: "BRL",
        });
      }
  
      handleOrderCompletion();
      navigate("/sucesso", {
        state: {
          paymentMethod: "pix",
          pixCopiaCola: qr_code, // só esse será usado
        },
      });
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
      alert("Erro ao processar pagamento com Pix.");
    }
  };
  
  

  // Função para gerar Boleto
  const generateBoleto = async () => {
    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          payment_method_id: "bolbradesco",
          transaction_amount: parseFloat(calculateTotal()),
          description: "Pagamento via Boleto",
          payer: {
            email: checkoutData.email,
            first_name: checkoutData.firstName,
            last_name: checkoutData.lastName,
            identification: { type: "CPF", number: checkoutData.cpf },
            address: {
              zip_code: userAddress.postalCode?.replace(/\D/g, ""), // Somente números
              street_name: userAddress.street,
              street_number: userAddress.number || "SN",
              neighborhood: userAddress.neighborhood || "Bairro",
              city: userAddress.city,
              federal_unit: userAddress.state,
            },
          },
          userId: checkoutData.userId,
          products: checkoutData.items.map((item: any) => ({
            productId: item.productId.split("-")[0],
            title: item.title || "Produto",
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
          })),
        }
      );
  
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
        window.gtag("event", "conversion", {
          send_to: "AW-17032473472/ZLo_CiP_t8AaEIlDX27k_",
          value: 1.0,
          currency: "BRL",
        });
      }
  
      handleOrderCompletion();
      navigate("/sucesso", {
        state: {
          paymentMethod: "boleto",
          boletoUrl: response.data.boletoUrl,
        },
      });
    } catch (error) {
      console.error("Erro ao gerar boleto:", error);
      alert("Erro ao gerar boleto. Verifique se o endereço está completo.");
    }
  };
  
  
  // Função para continuar o processo de pagamento
  const handleContinue = () => {
    if (paymentMethod === "card") {
      document.getElementById("form-checkout")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else if (paymentMethod === "pix") {
      generatePixQrCode();
    } else if (paymentMethod === "boleto") {
      generateBoleto();
    }
  };
  

  return (
    <Box
      sx={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        border: "1px solid #ddd",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box>
          <Typography>
  <strong>Endereço Cadastrado:</strong>
</Typography>
{userAddress ? (
  <>
    <Typography>
      {userAddress.street}, {userAddress.number || "SN"} - {userAddress.neighborhood}
      <br />
      {userAddress.city} - {userAddress.state}, {userAddress.postalCode}
    </Typography>
    <Button
      variant="outlined"
      sx={{
        mt: 1,
        color: "#313926",
        borderColor: "#313926",
        "&:hover": {
          backgroundColor: "#E6E3DB",
          borderColor: "#313926",
        },
      }}
      onClick={() => navigate("/meus-dados")}
    >
      Alterar
    </Button>
  </>
) : (
  <Typography>Carregando endereço cadastrado...</Typography>
)}

          </Box>

          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
              color: "#313926",
              paddingTop: 2,
            }}
          >
            Forma de Pagamento
          </Typography>

          {/* Botões de Seleção de Método de Pagamento */}
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ marginBottom: "15px" }}
          >
            <Grid item xs={12} md={4}>
              <Button
                variant={paymentMethod === "card" ? "contained" : "outlined"}
                fullWidth
                onClick={() => setPaymentMethod("card")}
                sx={{
                  height: "48px",
                  backgroundColor:
                    paymentMethod === "card" ? "#313926" : "#fff",
                  color: paymentMethod === "card" ? "#fff" : "#313926",
                  borderColor: "#313926",
                  "&:hover": {
                    backgroundColor:
                      paymentMethod === "card" ? "#E6E3DB" : "#f5f5f5",
                    borderColor: "#313926",
                  },
                }}
              >
                Cartão de Crédito
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant={paymentMethod === "pix" ? "contained" : "outlined"}
                fullWidth
                onClick={() => setPaymentMethod("pix")}
                sx={{
                  height: "48px",
                  backgroundColor: paymentMethod === "pix" ? "#313926" : "#fff",
                  color: paymentMethod === "pix" ? "#fff" : "#313926",
                  borderColor: "#313926",
                  "&:hover": {
                    backgroundColor:
                      paymentMethod === "pix" ? "#E6E3DB" : "#f5f5f5",
                    borderColor: "#313926",
                  },
                }}
              >
                Pix
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant={paymentMethod === "boleto" ? "contained" : "outlined"}
                fullWidth
                onClick={() => setPaymentMethod("boleto")}
                sx={{
                  height: "48px",
                  backgroundColor:
                    paymentMethod === "boleto" ? "#313926" : "#fff",
                  color: paymentMethod === "boleto" ? "#fff" : "#313926",
                  borderColor: "#313926",
                  "&:hover": {
                    backgroundColor:
                      paymentMethod === "boleto" ? "#E6E3DB" : "#f5f5f5",
                    borderColor: "#313926",
                  },
                }}
              >
                Boleto Bancário
              </Button>
            </Grid>
          </Grid>

          {paymentMethod === "card" && (
            <form
              id="form-checkout"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <Grid container spacing={2} justifyContent="center">
                {/* Número do Cartão */}
                <Grid item xs={12} md={10}>
                  <div
                    id="form-checkout__cardNumber"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Número do Cartão"
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </Grid>

                {/* Expiração e CVV */}
                <Grid item xs={6} md={5}>
                  <div
                    id="form-checkout__expirationDate"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="MM/AA"
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </Grid>

                <Grid item xs={6} md={5}>
                  <div
                    id="form-checkout__securityCode"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="CVV"
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </Grid>

                {/* Nome do Titular */}
                <Grid item xs={12} md={10}>
                  <input
                    type="text"
                    id="form-checkout__cardholderName"
                    placeholder="Nome do Titular (como no cartão)"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  />
                </Grid>

                {/* Selects */}
                <Grid item xs={6} md={5}>
                  <select
                    id="form-checkout__issuer"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="">Banco Emissor</option>
                  </select>
                </Grid>

                <Grid item xs={6} md={5}>
                  <select
                    id="form-checkout__installments"
                    value={selectedInstallment}
                    onChange={(e) =>
                      setSelectedInstallment(Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value={1}>1x sem juros</option>
                    <option value={2}>2x sem juros</option>
                  </select>
                </Grid>

                {/* Documento e CPF */}
                <Grid item xs={6} md={5}>
                  <select
                    id="form-checkout__identificationType"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="">Tipo de Documento</option>
                  </select>
                </Grid>

                <Grid item xs={6} md={5}>
                  <input
                    type="text"
                    id="form-checkout__identificationNumber"
                    placeholder="Número do Documento (CPF)"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} md={10}>
                  <input
                    type="email"
                    id="form-checkout__cardholderEmail"
                    placeholder="E-mail para Contato"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                    }}
                  />
                </Grid>

                {/* Botão Pagar Centralizado */}
                <Grid
                  item
                  xs={12}
                  md={10}
                  sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                ></Grid>
              </Grid>
            </form>
          )}

          {/* Outras Opções de Pagamento */}
          {paymentMethod === "pix" && (
            <Box sx={{ textAlign: "center", mt: 3 }}></Box>
          )}

          {paymentMethod === "boleto" && (
            <Box sx={{ textAlign: "center", mt: 3 }}></Box>
          )}
        </Grid>

        {/* Coluna: Resumo da Compra */}
        <Grid item xs={12} md={5} sx={{ paddingLeft: "20px" }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
              color: "#333",
            }}
          >
            Resumo da Compra
          </Typography>
          <Box
            sx={{
              padding: "15px",
              backgroundColor: "#fff",
              borderRadius: 1,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #ddd",
            }}
          >
            <Typography sx={{ mb: 1 }}>
              Valor dos Produtos: <strong>R$ {checkoutData?.amount}</strong>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Descontos:{" "}
              <strong>
                - R${" "}
                {paymentMethod === "pix"
                  ? ((parseFloat(checkoutData?.amount || "0") + freightCost) * 0.05).toFixed(2) // Calcula 5% do valor total + frete
                  : (checkoutData?.discount || "0.00")}
              </strong>
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", textAlign: "center", color: "#333" }}>
            Opção de Frete
          </Typography>

          <Box>
            {isLoadingFreight ? (
              <Typography sx={{ textAlign: "center", mt: 2 }}>Carregando opções de frete...</Typography>
            ) : freightOptions.length > 0 ? (
              (() => {
                const selectedFreight =
                  freightOptions.find((option) =>
                    option.name.toLowerCase().includes("package") // Ajuste para a modalidade mais adequada
                  ) || freightOptions[0]; // Fallback para a primeira opção caso não encontre

                // Atualiza o custo de frete no estado (apenas na primeira renderização)
                if (selectedFreight && freightCost !== Number(selectedFreight.price)) {
                  setFreightCost(Number(selectedFreight.price));
                }

                return (
                  <Box
                    sx={{
                      mb: 2,
                      borderBottom: "none",
                      paddingBottom: 2,
                    }}
                  >
                    {/* Espaço para a logo da transportadora */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <img
                        src="/jadlog.png" // Substitua pelo caminho correto da logo
                        alt="Logo da Transportadora"
                        style={{ width: "88px", height: "88px", marginRight: "10px" }}
                      />
                      <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>
                        {selectedFreight.company?.name || "Transportadora"}
                      </Typography>
                    </Box>

                    <Typography sx={{ mb: 1 }}>
                      <strong>Modalidade:</strong> {selectedFreight.name || "Indisponível"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Valor:</strong> R$ {Number(selectedFreight.price || 0).toFixed(2)}
                    </Typography>
                  </Box>
                );
              })()
            ) : (
              <Typography sx={{ textAlign: "center", mt: 2 }}>
                Nenhuma opção de frete disponível.
              </Typography>
            )}
          </Box>

          <Typography sx={{ mb: 2 }}>
            Total: <strong>R$ {calculateTotal()}</strong>
          </Typography>


          <Button
            variant="contained"
            type="button"
            onClick={handleContinue}
            disabled={isLoadingFreight || !freightCost || (paymentMethod === "card" && !isMpReady)}
            sx={{
              width: "100%",
              backgroundColor: isLoadingFreight ? "#aaa" : "#313926",
              "&:hover": { backgroundColor: isLoadingFreight ? "#aaa" : "#4caf50" },
              textAlign: "center",
            }}
          >
            {isLoadingFreight ? "Carregando..." : "Continuar"}
          </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout;