// contexts/UserContext.tsx
<<<<<<< HEAD
import React, { createContext, useContext, useState } from 'react';
=======
import React, { createContext, useContext, useState, useEffect } from 'react';
>>>>>>> d33dfa6a714403b4391b7cdbc6ca32a154d199fd

type UserContextType = {
  name: string;
  setName: (name: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
<<<<<<< HEAD
  const [name, setNameState] = useState<string>(() => {
    return localStorage.getItem('userName') || '';
  });
=======
  const [name, setNameState] = useState<string>('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setNameState(storedName);
    }
  }, []);
>>>>>>> d33dfa6a714403b4391b7cdbc6ca32a154d199fd

  const setName = (newName: string) => {
    setNameState(newName);
    localStorage.setItem('userName', newName);
  };

  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
