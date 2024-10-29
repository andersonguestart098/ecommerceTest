import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1); // Valor padrão como 1 parcela
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
        amount: String(parsedData.amount > 1 ? parsedData.amount : 1), // Garantindo valor mínimo
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
          identificationType: {
            id: "form-checkout__identificationType",
            placeholder: "Tipo de documento",
          },
          identificationNumber: {
            id: "form-checkout__identificationNumber",
            placeholder: "CPF",
          },
          cardholderEmail: {
            id: "form-checkout__cardholderEmail",
            placeholder: "E-mail",
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
              const installments = paymentMethods[0].payer_costs.map(
                (option: any) => option.installments
              );
              setInstallmentOptions(installments);
              setSelectedInstallment(installments[0] || 1); // Define o valor inicial como a primeira opção disponível
            } else {
              console.warn("Nenhuma opção de parcelamento disponível.");
              setInstallmentOptions([1]); // Define como pagamento em uma parcela
              setSelectedInstallment(1);
            }
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            const formData = cardForm.getCardFormData();

            // Verificar se os campos obrigatórios estão preenchidos
            if (!formData.amount || Number(formData.amount) <= 0) {
              alert("Erro: valor do pagamento é inválido.");
              return;
            }

            const paymentData = {
              token: formData.token,
              issuer_id: formData.issuerId,
              payment_method_id: formData.paymentMethodId,
              transaction_amount: Math.max(Number(formData.amount), 1), // Garante valor mínimo de 1
              installments: selectedInstallment,
              description: "Descrição do produto",
              payer: {
                email: formData.cardholderEmail,
                identification: {
                  type: formData.identificationType || "CPF",
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

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Pagamento</h2>
      <form
        id="form-checkout"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div id="form-checkout__cardNumber" className="container"></div>
        <div id="form-checkout__expirationDate" className="container"></div>
        <div id="form-checkout__securityCode" className="container"></div>
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
          {installmentOptions.map((installment) => (
            <option key={installment} value={installment}>
              {installment}x
            </option>
          ))}
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

        <button type="submit" id="form-checkout__submit" disabled={!isMpReady}>
          Pagar
        </button>
        <progress value="0" className="progress-bar">
          Carregando...
        </progress>
      </form>
      <style>
        {`
          .container {
            height: 18px;
            display: inline-block;
            border: 1px solid rgb(118, 118, 118);
            border-radius: 2px;
            padding: 1px 2px;
            margin-bottom: 10px;
          }
          #form-checkout {
            display: flex;
            flex-direction: column;
            max-width: 600px;
          }
        `}
      </style>
    </div>
  );
};

export default Checkout;
