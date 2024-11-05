import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  name: string;
  type: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Loaded user from localStorage:", storedUser); // Log para verificar o valor carregado do localStorage
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      console.log("Saved user to localStorage:", newUser); // Log para verificar o salvamento do usuário
    } else {
      localStorage.removeItem("user");
      console.log("Removed user from localStorage"); // Log para remoção
    }
    setUserState(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      console.log("Storage changed, updated user:", updatedUser); // Log para verificar mudanças no localStorage
      setUserState(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
