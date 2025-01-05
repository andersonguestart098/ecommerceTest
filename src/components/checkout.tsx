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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isMpReady, setIsMpReady] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);
  const { handleOrderCompletion } = useCart();
  const [userAddress, setUserAddress] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [freightCost, setFreightCost] = useState<number>(0);
  const [isLoadingFreight, setIsLoadingFreight] = useState(false);
  const [freightOptions, setFreightOptions] = useState<any[]>([]); // Armazena todas as opções de frete


  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;

  // Função para calcular o total do pedido
  const calculateTotal = () => {
    if (!checkoutData) {
      console.warn("Dados de checkout não encontrados.");
      return "0.00";
    }
  
    const amount = parseFloat(checkoutData.amount || "0") || 0;
    const shippingCost = freightCost || 0; // Usa o valor atualizado do frete
    const discount = parseFloat(checkoutData.discount || "0") || 0;
  
    let totalAmount = amount + shippingCost - discount;
  
    // Aplica desconto de 5% se o método de pagamento for Pix
    if (paymentMethod === "pix") {
      const pixDiscount = totalAmount * 0.05;
      totalAmount -= pixDiscount;
    }
  
    return Math.max(totalAmount, 0).toFixed(2); // Garante que o valor nunca seja negativo
  };
  

  useEffect(() => {
    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      try {
        const parsedCheckoutData = JSON.parse(storedCheckoutData);
        setCheckoutData(parsedCheckoutData);
        console.log("CheckoutData carregado com sucesso:", parsedCheckoutData);
      } catch (error) {
        console.error("Erro ao carregar checkoutData:", error);
        alert("Erro ao carregar os dados do pedido.");
        navigate("/cart");
      }
    } else {
      console.error("CheckoutData não encontrado no localStorage.");
      alert("Dados do pedido não encontrados.");
      navigate("/cart");
    }
  }, [navigate]);
  
  

  const fetchUserAndCalculateFreight = async (checkoutData: any) => {
    try {
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
  
      // Ajuste para incluir a quantidade de cada produto
      const productsWithQuantities = checkoutData.items.map((item: any) => ({
        productId: item.productId.split("-")[0], // Remove o sufixo após o "-"
        quantity: item.quantity, // Inclui a quantidade de caixas
      }));
  
      const freightPayload = {
        cepOrigem: "90200290",
        cepDestino: user.address.postalCode.replace(/\s+/g, ""), // Remove espaços
        products: productsWithQuantities, // Envia o array de produtos com IDs e quantidades
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
      } else {
        setFreightOptions([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário ou calcular frete:", error);
    }
  };
  
  
  useEffect(() => {
    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      const parsedCheckoutData = JSON.parse(storedCheckoutData);
      console.log("Dados de checkout carregados:", parsedCheckoutData);
      setCheckoutData(parsedCheckoutData);
      fetchUserAndCalculateFreight(parsedCheckoutData);
    } else {
      console.error("Dados de checkout não encontrados.");
      alert("Erro: Dados de checkout não encontrados.");
      navigate("/cart");
    }
  }, [navigate]);
   

  const handleFinalizeOrder = () => {
    handleOrderCompletion(); // Limpa o carrinho
    navigate("/sucesso", { state: { paymentMethod: "boleto" } }); // Redireciona para a página de sucesso
  };

  useEffect(() => {
    if (paymentMethod === "card") {
      setIsLoading(true); // Mostra o spinner enquanto monta o formulário
      setTimeout(() => {
        loadMercadoPago(); // Carrega novamente o SDK e o formulário
        setIsLoading(false);
      }, 500); // Simula um pequeno atraso para o usuário perceber o carregamento
    }
  }, [paymentMethod]);

  useEffect(() => {
    // Incrementa a chave sempre que o método de pagamento mudar
    setFormKey((prevKey) => prevKey + 1);
  }, [paymentMethod]);


  

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Buscando dados do usuário no backend...");

        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Token não encontrado. Redirecionando para login.");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` }, // Passa o token no cabeçalho
          }
        );

        const user = response.data;

        if (user.address) {
          console.log("Endereço carregado com sucesso:", user.address);
          setUserAddress(user.address);
          setDeliveryAddress(user.address);
        } else {
          console.warn("Usuário não possui endereço cadastrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (paymentMethod === "card" && checkoutData) {
      // Certifique-se de que os dados estejam carregados
      loadMercadoPago();
    }
  }, [paymentMethod, checkoutData]);

  const loadMercadoPago = () => {
    console.log("Carregando SDK do Mercado Pago...");
    if (document.getElementById("mercado-pago-sdk")) {
      console.log("SDK do Mercado Pago já carregado.");
      checkMercadoPagoAvailability();
      return;
    }

    const script = document.createElement("script");
    script.id = "mercado-pago-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      console.log("SDK do Mercado Pago carregado com sucesso.");
      checkMercadoPagoAvailability();
    };
    script.onerror = () => {
      console.error("Erro ao carregar o SDK do Mercado Pago.");
    };
    document.body.appendChild(script);
  };

  const checkMercadoPagoAvailability = () => {
    if ((window as any).MercadoPago) {
      initializeCardForm();
    } else {
      console.error("MercadoPago SDK não carregado corretamente.");
    }
  };

  const initializeCardForm = () => {
    if (!publicKey) {
      console.error("Chave Pública do Mercado Pago não encontrada!");
      return;
    }

    const mp = new (window as any).MercadoPago(publicKey, { locale: "pt-BR" });

    const cardFormInstance = mp.cardForm({
      amount: String(parseFloat(checkoutData?.amount.replace(",", ".") || "0")),
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número do Cartão",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/AA",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "CVV",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Nome do Titular",
        },
        issuer: { id: "form-checkout__issuer" },
        installments: { id: "form-checkout__installments" },
        identificationType: { id: "form-checkout__identificationType" },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "Número do Documento (CPF)",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
          placeholder: "E-mail para Contato",
        },
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) {
            console.warn("Erro ao montar formulário:", error);
          } else {
            setIsMpReady(true);
          }
        },
        onSubmit: async (event: any) => {
          event.preventDefault();
          const formData = cardFormInstance.getCardFormData(); // Certifique-se de que cardFormInstance está correto aqui
          if (formData) {
            handleCardPayment(formData);
          } else {
            console.error("Erro ao obter os dados do formulário.");
          }
        },
      },
    });
  };

  const handleCardPayment = async (formData: any) => {
    try {
      if (!formData || !formData.token || !formData.paymentMethodId) {
        throw new Error(
          "Dados do formulário incompletos. Verifique os campos."
        );
      }
  
      const cardholderName = formData.cardholderName || "";
      const nameParts = cardholderName.split(" ");
      const firstName = nameParts[0] || "N/A";
      const lastName = nameParts.slice(1).join(" ") || "N/A";
  
      const paymentData = {
        token: formData.token,
        issuer_id: formData.issuerId,
        payment_method_id: formData.paymentMethodId,
        transaction_amount: parseFloat(calculateTotal()),
        installments: selectedInstallment,
        description: "Compra em Nato Pisos",
        payer: {
          email: formData.cardholderEmail || "",
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: formData.identificationType || "CPF",
            number: formData.identificationNumber || "",
          },
        },
        // Ajusta os IDs dos produtos
        products: checkoutData.items.map((item: any) => ({
          ...item,
          productId: item.productId.split("-")[0], // Remove o sufixo após o "-"
        })),
        userId: checkoutData.userId,
      };
  
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        paymentData
      );
  
      if (response.data.status === "approved") {
        handleOrderCompletion(); // Limpa o carrinho
        navigate("/sucesso", { state: { paymentMethod: "card" } });
      } else {
        alert("Pagamento não aprovado.");
      }
    } catch (error) {
      console.error("Erro no envio ao backend:", error);
      alert("Ocorreu um erro ao processar o pagamento.");
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
            identification: {
              type: "CPF",
              number: checkoutData.cpf,
            },
          },
          userId: checkoutData.userId,
          // Ajusta os IDs dos produtos
          products: checkoutData.items.map((item: any) => ({
            ...item,

            productId: item.productId.split("-")[0], // Remove o sufixo após o "-"
          })),
        }
      );
  
      const qrCodeBase64 = response.data.qr_code_base64;
      if (qrCodeBase64) {
        const qrCode = `data:image/png;base64,${qrCodeBase64}`;
        setQrCode(qrCode);
        handleOrderCompletion(); // Limpa o carrinho
        navigate("/sucesso", {
          state: {
            paymentMethod: "pix",
            pixQrCode: qrCode,
          },
        });
      } else {
        alert("QR Code não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com Pix:", error);
    }
  };
  
  const generateBoleto = async () => {
    try {
      const userId = checkoutData?.userId;
  
      if (!userId) {
        throw new Error("Usuário não encontrado para emissão do boleto.");
      }
  
      const response = await axios.get(
        `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${userId}`
      );
  
      const { email, name, cpf, address } = response.data;
  
      if (!address) {
        throw new Error("Endereço não encontrado para o usuário.");
      }
  
      const [firstName, ...lastNameArray] = name.split(" ");
      const lastName = lastNameArray.join(" ");
  
      const boletoResponse = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          payment_method_id: "bolbradesco",
          transaction_amount: parseFloat(calculateTotal()),
          description: "Pagamento via Boleto Bancário",
          payer: {
            email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: "CPF",
              number: cpf,
            },
            address: {
              zip_code: address.postalCode,
              street_name: address.street,
              street_number: address.number || "SN",
              neighborhood: address.neighborhood || "Centro",
              city: address.city,
              federal_unit: address.state,
            },
          },
          userId,
          // Ajusta os IDs dos produtos
          products: checkoutData.items.map((item: any) => ({
            ...item,
            productId: item.productId.split("-")[0], // Remove o sufixo após o "-"
          })),
        }
      );
  
      const boletoUrl = boletoResponse.data.boletoUrl;
  
      if (boletoUrl) {
        setBoletoUrl(boletoUrl);
        handleOrderCompletion(); // Limpa o carrinho
        navigate("/sucesso", {
          state: {
            paymentMethod: "boleto",
            boletoUrl,
          },
        });
      } else {
        console.warn("Link do boleto não encontrado.");
      }
    } catch (error: any) {
      console.error("Erro ao processar pagamento com boleto:", error.message || error);
      alert(`Erro ao gerar boleto: ${error.message}`);
    }
  };
  

  const handleContinue = () => {
    if (paymentMethod === "card") {
      const form = document.getElementById("form-checkout");
      if (form) {
        form.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        ); // Submete o formulário do cartão
      }
    } else if (paymentMethod === "pix") {
      generatePixQrCode(); // Gera o QR Code para Pix
    } else if (paymentMethod === "boleto") {
      generateBoleto(); // Gera o boleto
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

          <Box
            sx={{
              padding: "15px",
              backgroundColor: "#fff",
              borderRadius: 1,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #ddd",
            }}
          >
            {freightOptions.length > 0 ? (
              (() => {
                // Filtra para pegar a modalidade mais adequada da Jadlog
                const selectedFreight = freightOptions.find(option =>
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
              <Typography>Nenhuma opção de frete disponível.</Typography>
            )}
          </Box>




          <Typography sx={{ mb: 2 }}>
            Total: <strong>R$ {calculateTotal()}</strong>
          </Typography>


            <Button
              variant="contained"
              type="button"
              onClick={handleContinue} // Chama a função com base no método de pagamento
              disabled={paymentMethod === "card" && !isMpReady}
              sx={{
                width: "100%", // Igualando largura do botão
                backgroundColor: "#313926",
                "&:hover": { backgroundColor: "#4caf50" },
                textAlign: "center",
              }}
            >
              Continuar
            </Button>

            <Button
              variant="outlined"
              sx={{
                mt: 2,
                width: "100%",
                borderColor: "#aaa",
                "&:hover": { borderColor: "#333" },
              }}
            >
              Voltar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout;