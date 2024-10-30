import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [deviceId, setDeviceId] = useState<string | null>("default_device_id");

  useEffect(() => {
    const checkoutData = localStorage.getItem("checkoutData");
    const parsedData = checkoutData ? JSON.parse(checkoutData) : { amount: 100.5, items: [] };

    console.log("Dados de checkout carregados:", parsedData);

    // Captura do userId do localStorage
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;
    if (!userId) {
      console.error("User ID não encontrado no localStorage.");
      return;
    }

    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    const initializeMercadoPago = async () => {
      const mp = new (window as any).MercadoPago(publicKey, { locale: "pt-BR" });

      const capturedDeviceId = await new Promise<string>((resolve) => {
        const interval = setInterval(() => {
          const device = window.MP_DEVICE_SESSION_ID;
          if (device) {
            clearInterval(interval);
            resolve(device);
          }
        }, 100); // Verifica a cada 100ms até capturar
      });

      setDeviceId(capturedDeviceId);
      console.log("Device ID gerado:", capturedDeviceId);

      const cardForm = mp.cardForm({
        amount: String(parsedData.amount > 1 ? parsedData.amount : 1),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do cartão" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "Código de segurança" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Titular do cartão" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "CPF" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "E-mail" },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) return console.warn("Erro ao montar o formulário: ", error);
            setIsMpReady(true);
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            const formData = cardForm.getCardFormData();
            console.log("Dados do formulário de pagamento:", formData);

            if (!formData.token) {
              alert("Erro: Não foi possível criar o token do cartão.");
              return;
            }

            const items = parsedData.items.map((item: any) => ({
              productId: String(item.id), // substitua 'id' por 'productId'
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              description: item.description,
              category_id: item.category_id || "default",
            }));
            

            const paymentData = {
              token: formData.token,
              issuer_id: formData.issuerId,
              payment_method_id: formData.paymentMethodId,
              transaction_amount: Math.max(Number(formData.amount), 1),
              installments: selectedInstallment,
              description: "Descrição do produto",
              payer: {
                email: formData.cardholderEmail,
                first_name: formData.cardholderName?.split(" ")[0] || "",
                last_name: formData.cardholderName?.split(" ").slice(1).join(" ") || "",
                identification: { type: formData.identificationType || "CPF", number: formData.identificationNumber },
              },
              device_id: capturedDeviceId || "default_device_id",
              items,
            };

            console.log("Dados de pagamento prontos para envio:", paymentData);

            try {
              const response = await axios.post(
                "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
                { ...paymentData, userId }
              );

              console.log("Resposta do servidor após pagamento:", response.data);

              if (response.data.status === "approved") {
                navigate("/sucesso");
              } else {
                alert("Pagamento pendente ou falhou. Verifique a transação.");
              }
            } catch (error) {
              console.error("Erro ao finalizar o pagamento:", error);
              alert("Erro ao finalizar o pagamento.");
            }
          },
        },
      });
    };

    const scriptSdk = document.createElement("script");
    scriptSdk.src = "https://sdk.mercadopago.com/js/v2";
    scriptSdk.async = true;
    scriptSdk.onload = initializeMercadoPago;
    document.body.appendChild(scriptSdk);

    const scriptSecurity = document.createElement("script");
    scriptSecurity.src = "https://www.mercadopago.com/v2/security.js";
    scriptSecurity.setAttribute("view", "checkout");
    document.body.appendChild(scriptSecurity);

    return () => {
      document.body.removeChild(scriptSdk);
      document.body.removeChild(scriptSecurity);
    };
  }, [publicKey]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Pagamento</h2>
      <form id="form-checkout" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div id="form-checkout__cardNumber" className="container"></div>
        <div id="form-checkout__expirationDate" className="container"></div>
        <div id="form-checkout__securityCode" className="container"></div>
        <input type="text" id="form-checkout__cardholderName" placeholder="Titular do cartão" />
        <select id="form-checkout__issuer"></select>
        <select id="form-checkout__installments" value={selectedInstallment} onChange={(e) => setSelectedInstallment(Number(e.target.value))}>
          {installmentOptions.map((installment) => (
            <option key={installment} value={installment}>{installment}x</option>
          ))}
        </select>
        <select id="form-checkout__identificationType"></select>
        <input type="text" id="form-checkout__identificationNumber" placeholder="CPF" />
        <input type="email" id="form-checkout__cardholderEmail" placeholder="E-mail" />
        <button type="submit" id="form-checkout__submit" disabled={!isMpReady}>Pagar</button>
        <progress value="0" className="progress-bar">Carregando...</progress>
      </form>
    </div>
  );
};

export default Checkout;
