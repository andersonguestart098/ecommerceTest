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
}

interface CartItem extends Product {
  quantity: number;
  metersPerBox: number; // Certificando de que esses campos sempre estejam presentes
  weightPerBox: number;
  boxDimensions: string;
  materialType: string;
  freightClass: number;
}

interface CartContextType {
  cart: CartItem[];
  cepDestino: string | null;
  setCepDestino: (cep: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const convertToCartItem = (product: Product): CartItem => ({
  ...product,
  metersPerBox: product.metersPerBox || 0,
  weightPerBox: product.weightPerBox || 0,
  boxDimensions: product.boxDimensions || "0x0x0",
  materialType: product.materialType || "Desconhecido",
  freightClass: product.freightClass || 0,
  quantity: 1,
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

  const addToCart = (product: Product) => {
    const cartItem = convertToCartItem(product);

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
