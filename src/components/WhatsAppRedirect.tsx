import { useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const WhatsAppRedirect = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
      // Evento oficial de conversão do Google Ads
      window.gtag("event", "conversion", {
        send_to: "AW-17032473472/MnXxCLf5j78aEIDX27k_",
      });
  
      // Evento opcional para métricas personalizadas
      window.gtag("event", "whatsapp_click", {
        event_category: "Contato",
        event_label: "Botão WhatsApp via rota interna",
      });
    }
  
    setTimeout(() => {
      window.location.href =
        "https://wa.me/555198688559?text=Ol%C3%A1%2C%20estive%20no%20site%20da%20Nato%20Pisos%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.";
    }, 2000);
  }, []);
  

  return (
    <Box
      sx={{
        backgroundColor: "#E6E3DB",
        color: "#313926",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: 4,
      }}
    >
      <CircularProgress sx={{ color: "#313926", mb: 3 }} />
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        Redirecionando para o WhatsApp...
      </Typography>
      <Typography variant="body2">
        Aguarde um momento. Você será encaminhado para nosso atendimento.
      </Typography>
    </Box>
  );
};

export default WhatsAppRedirect;
