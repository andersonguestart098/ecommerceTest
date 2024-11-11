import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  paymentOptions: string[];
  image: string;
  colors: { name: string; image: string }[];
  metersPerBox?: number;
  weightPerBox?: number;
  boxDimensions?: string;
  materialType?: string;
  freightClass?: number;
  category_id?: string;
}

interface CartItem extends Product {
  quantity: number;
  metersPerBox: number;
  weightPerBox: number;
  boxDimensions: string;
  materialType: string;
  freightClass: number;
  selectedColorImage: string;
}

interface CartContextType {
  cart: CartItem[];
  cepDestino: string | null;
  setCepDestino: (cep: string) => void;
  addToCart: (product: Product, colorImage?: string) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  handleOrderCompletion: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const convertToCartItem = (product: Product, colorImage: string): CartItem => ({
  ...product,
  metersPerBox: product.metersPerBox || 0,
  weightPerBox: product.weightPerBox || 0,
  boxDimensions: product.boxDimensions || "0x0x0",
  materialType: product.materialType || "Desconhecido",
  freightClass: product.freightClass || 0,
  quantity: 1,
  category_id: product.category_id || "default",
  selectedColorImage: colorImage,
});

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cepDestino, setCepDestino] = useState<string | null>(() => {
    const savedCep = localStorage.getItem("cepDestino");
    return savedCep || null;
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (cepDestino) {
      localStorage.setItem("cepDestino", cepDestino);
    }
  }, [cart, cepDestino]);

  useEffect(() => {
    console.log("Carrinho atualizado:", cart);
  }, [cart]);

  const addToCart = (product: Product, colorImage?: string) => {
    const cartItem = convertToCartItem(product, colorImage || product.image);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + cartItem.quantity }
            : item
        );
      } else {
        return [...prevCart, cartItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const handleOrderCompletion = () => {
    console.log("Pedido finalizado! Limpando o carrinho...");
    clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cepDestino,
        setCepDestino,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        handleOrderCompletion,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
