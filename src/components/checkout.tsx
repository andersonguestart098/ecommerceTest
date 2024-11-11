import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isMpReady, setIsMpReady] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;

  useEffect(() => {
    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData));
    } else {
      alert("Erro: Dados de checkout não encontrados.");
      navigate("/cart");
    }
  }, [navigate]);

  useEffect(() => {
    if (paymentMethod === "card") {
      loadMercadoPago();
    }
  }, [paymentMethod]);

  const loadMercadoPago = () => {
    if (document.getElementById("mercado-pago-sdk")) {
      checkMercadoPagoAvailability();
      return;
    }

    const script = document.createElement("script");
    script.id = "mercado-pago-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = checkMercadoPagoAvailability;
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

    mp.cardForm({
      amount: String(parseFloat(checkoutData?.amount.replace(",", ".") || "0")),
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: { id: "form-checkout__cardNumber" },
        expirationDate: { id: "form-checkout__expirationDate" },
        securityCode: { id: "form-checkout__securityCode" },
        cardholderName: { id: "form-checkout__cardholderName" },
        issuer: { id: "form-checkout__issuer" },
        installments: { id: "form-checkout__installments" },
        identificationType: { id: "form-checkout__identificationType" },
        identificationNumber: { id: "form-checkout__identificationNumber" },
        cardholderEmail: { id: "form-checkout__cardholderEmail" },
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
          const formData = mp.cardForm().getCardFormData();
          handleCardPayment(formData);
        },
      },
    });
  };

  const handleCardPayment = async (formData: any) => {
    try {
      const paymentData = {
        token: formData.token,
        issuer_id: formData.issuerId,
        payment_method_id: formData.paymentMethodId,
        transaction_amount: parseFloat(checkoutData.amount.replace(",", ".")),
        installments: selectedInstallment,
        description: "Compra em Nato Pisos",
        payer: {
          email: formData.cardholderEmail,
          first_name: formData.cardholderName.split(" ")[0],
          last_name: formData.cardholderName.split(" ").slice(1).join(" "),
          identification: {
            type: formData.identificationType,
            number: formData.identificationNumber,
          },
        },
        products: checkoutData.items,
        userId: checkoutData.userId,
      };

      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        paymentData
      );

      if (response.data.status === "approved") {
        navigate("/sucesso", { state: { paymentMethod: "card" } });
      } else {
        alert("Pagamento não aprovado.");
      }
    } catch (error) {
      console.error("Erro no envio ao backend:", error);
    }
  };

  const generatePixQrCode = async () => {
    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          payment_method_id: "pix",
          transaction_amount: parseFloat(checkoutData.amount),
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
          products: checkoutData.items,
        }
      );
  
      const qrCodeBase64 = response.data.qr_code_base64;
      console.log("QR Code recebido:", qrCodeBase64); // Log para depuração
  
      if (qrCodeBase64) {
        const qrCode = `data:image/png;base64,${qrCodeBase64}`;
        setQrCode(qrCode);
  
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
  
      // Busca os dados do usuário com endereço completo
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
          transaction_amount: parseFloat(checkoutData.amount),
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
          products: checkoutData.items,
        }
      );
  
      const boletoUrl = boletoResponse.data.boletoUrl; // Aqui está a URL retornada do backend.
  
      if (boletoUrl) {
        setBoletoUrl(boletoUrl); // Define o link no estado.
      } else {
        console.warn("Link do boleto não encontrado.");
      }
  
      navigate("/sucesso", {
        state: {
          paymentMethod: "boleto",
          boletoUrl, // Passa o link para a página de sucesso.
        },
      });
  
    } catch (error: any) {
      console.error("Erro ao processar pagamento com boleto:", error.message || error);
      alert(`Erro ao gerar boleto: ${error.message}`);
    }
  };
  
  

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Pagamento</h2>
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="card">Cartão</option>
        <option value="pix">Pix</option>
        <option value="boleto">Boleto</option>
      </select>

      {paymentMethod === "card" && (
        <form
          id="form-checkout"
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <div id="form-checkout__cardNumber"></div>
          <div id="form-checkout__expirationDate"></div>
          <div id="form-checkout__securityCode"></div>
          <input
            type="text"
            id="form-checkout__cardholderName"
            placeholder="Titular do cartão"
          />
          <select id="form-checkout__issuer"></select>
          <select
            id="form-checkout__installments"
            value={selectedInstallment}
            onChange={(e) => setSelectedInstallment(Number(e.target.value))}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
          <select id="form-checkout__identificationType"></select>
          <input
            type="text"
            id="form-checkout__identificationNumber"
            placeholder="CPF"
          />
          <input
            type="email"
            id="form-checkout__cardholderEmail"
            placeholder="E-mail"
          />
          <button type="submit" disabled={!isMpReady}>
            Pagar
          </button>
        </form>
      )}

      {paymentMethod === "pix" && (
        <div>
          <button onClick={generatePixQrCode}>Gerar QR Code Pix</button>
          {qrCode && <img src={qrCode} alt="QR Code Pix" />}
        </div>
      )}

      {paymentMethod === "boleto" && (
        <div>
          <button onClick={generateBoleto}>Gerar Boleto</button>
          {boletoUrl && (
            <a href={boletoUrl} target="_blank" rel="noopener noreferrer">
              Visualizar Boleto
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkout;
