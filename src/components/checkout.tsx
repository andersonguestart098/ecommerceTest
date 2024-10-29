import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [deviceId, setDeviceId] = useState<string | null>(null);

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

      // Criar Device ID para rastrear o dispositivo do cliente
      const deviceModule = mp.device;
      const generatedDeviceId = deviceModule.create();
      setDeviceId(generatedDeviceId);

      const cardForm = mp.cardForm({
        amount: String(parsedData.amount > 1 ? parsedData.amount : 1),
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
          onValidityChange: (error: any, field: any) => {
            if (error) {
              console.error("Erro de validação no formulário:", field);
              alert(
                "Erro de validação em um ou mais campos. Corrija antes de continuar."
              );
            }
          },
          onError: (error: any) => {
            console.error("Erro ao criar token de cartão:", error);
            alert(
              `Erro ao processar pagamento: ${
                error.message || "verifique os dados e tente novamente"
              }`
            );
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            const formData = cardForm.getCardFormData();

            if (!formData.token) {
              alert("Erro: Não foi possível criar o token do cartão.");
              return;
            }

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
                last_name:
                  formData.cardholderName?.split(" ").slice(1).join(" ") || "",
                identification: {
                  type: formData.identificationType || "CPF",
                  number: formData.identificationNumber,
                },
              },
              device_id: deviceId, // Enviar o device_id gerado
              items: parsedData.items || [], // Enviar itens com categoria ao backend
            };

            console.log("Dados de pagamento:", paymentData); // Log para verificar os dados enviados

            try {
              const response = await axios.post(
                "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
                paymentData
              );

              console.log("Resposta do servidor:", response.data); // Log da resposta do servidor

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
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
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
            padding: 8px;
            margin-bottom: 10px;
          }
          #form-checkout {
            display: flex;
            flex-direction: column;
            max-width: 600px;
          }
          #form-checkout__submit {
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
          }
          #form-checkout__submit:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

export default Checkout;
