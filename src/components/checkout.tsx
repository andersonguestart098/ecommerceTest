import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;

  useEffect(() => {
    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    const initializeMercadoPago = () => {
      const mp = new (window as any).MercadoPago(publicKey, {
        locale: "pt-BR",
      });

      mp.cardForm({
        amount: "100.5",
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
            type: "text",
            maxlength: "3",
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
            placeholder: "Número do documento",
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
          onSubmit: async (event: any) => {
            event.preventDefault();
            const {
              paymentMethodId,
              issuerId,
              cardholderEmail,
              amount,
              token,
              installments,
              identificationNumber,
              identificationType,
              securityCode,
            } = mp.cardForm().getCardFormData();

            // Validação extra de securityCode
            if (
              !securityCode ||
              isNaN(Number(securityCode)) ||
              securityCode.length !== 3
            ) {
              alert("O código de segurança deve ser numérico e ter 3 dígitos.");
              return;
            }

            try {
              const response = await axios.post("/process_payment", {
                token,
                issuer_id: issuerId,
                payment_method_id: paymentMethodId,
                transaction_amount: Number(amount),
                installments: Number(installments),
                description: "Descrição do produto",
                payer: {
                  email: cardholderEmail,
                  identification: {
                    type: identificationType,
                    number: identificationNumber,
                  },
                },
              });
              if (response.data.status === "approved") {
                navigate("/sucesso");
              } else {
                alert("Pagamento pendente ou falhou. Verifique a transação.");
              }
            } catch (error) {
              console.error("Erro ao processar pagamento:", error);
              alert("Erro ao finalizar o pagamento.");
            }
          },
          onFetching: (resource: any) => {
            console.log("Fetching resource: ", resource);
            const progressBar = document.querySelector(".progress-bar");
            progressBar?.removeAttribute("value");

            return () => {
              progressBar?.setAttribute("value", "0");
            };
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
    <div>
      <h2>Pagamento</h2>
      <form id="form-checkout">
        <div id="form-checkout__cardNumber" className="container"></div>
        <div id="form-checkout__expirationDate" className="container"></div>
        <div id="form-checkout__securityCode" className="container"></div>
        <input
          type="text"
          id="form-checkout__cardholderName"
          placeholder="Titular do cartão"
        />
        <select id="form-checkout__issuer"></select>
        <select id="form-checkout__installments"></select>
        <select id="form-checkout__identificationType"></select>
        <input
          type="text"
          id="form-checkout__identificationNumber"
          placeholder="Número do documento"
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
    </div>
  );
};

export default Checkout;
