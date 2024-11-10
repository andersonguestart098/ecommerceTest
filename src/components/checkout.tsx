import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface CheckoutItem {
  productId: string;
  name: string;
  quantity: number;
  unit_price: number;
  description: string;
  category_id?: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;

  useEffect(() => {
    const checkoutData = localStorage.getItem("checkoutData");
    const parsedData = checkoutData
      ? JSON.parse(checkoutData)
      : { amount: "0", items: [], userId: null };

    console.log("Dados de checkout carregados:", parsedData);

    const { amount, items, userId } = parsedData;

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

      const cardForm = mp.cardForm({
        amount: String(parseFloat(amount.replace(",", "."))), // Garantir valor numérico
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
              return;
            }
            setIsMpReady(true);
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            const formData = cardForm.getCardFormData();
      
            // Log detalhado dos dados do formulário
            console.log("Dados do formulário de pagamento capturados:", formData);
      
            if (!formData.token) {
              console.error("Erro ao capturar token: Token não gerado.");
              alert("Erro ao gerar token de cartão.");
              return;
            }
      
            // Log do token gerado
            console.log("Token gerado com sucesso:", formData.token);
      
            const [firstName = "", ...lastNameParts] = (formData.cardholderName || "").split(" ");
            const lastName = lastNameParts.join(" ");
      
            const paymentProducts: CheckoutItem[] = (items as any[]).map((item) => ({
              productId: item.productId,
              name: item.title, 
              quantity: item.quantity,
              unit_price: parseFloat(item.unit_price),
              description: item.description,
              category_id: item.category_id || "default",
            }));
      
            const paymentData = {
              token: formData.token,
              issuer_id: formData.issuerId,
              payment_method_id: formData.paymentMethodId,
              transaction_amount: parseFloat(amount.replace(",", ".")),
              installments: selectedInstallment,
              description: "Compra em Nato Pisos",
              payer: {
                email: formData.cardholderEmail,
                first_name: firstName,
                last_name: lastName,
                identification: {
                  type: formData.identificationType,
                  number: formData.identificationNumber,
                },
              },
              products: paymentProducts,
              userId,
            };
      
            console.log("Dados de pagamento enviados ao backend:", paymentData);
      
            try {
              const response = await axios.post(
                "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
                paymentData
              );
      
              if (response.data.status === "approved") {
                console.log("Pagamento aprovado.");
                navigate("/sucesso");
              } else {
                console.warn("Pagamento não aprovado.", response.data);
                alert("Pagamento não aprovado.");
              }
            } catch (error) {
              console.error("Erro no envio ao backend:", error);
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

    return () => {
      document.body.removeChild(scriptSdk);
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
