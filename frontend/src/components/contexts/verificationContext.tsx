"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

type VerificationContextType = {
  isVerified: boolean;
  setVerificationStatus: (status: boolean) => void;
};

const VerificationContext = createContext<VerificationContextType>({
  isVerified: false,
  setVerificationStatus: () => {}
});

type VerificationProviderProps = {
  children: ReactNode;
};

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);

  const setVerificationStatus = async (status: boolean) => {
    console.log("Setting verification status:", status);
    await setIsVerified(status);
    console.log("Verification status:", isVerified);
  };

  return (
    <VerificationContext.Provider value={{ isVerified, setVerificationStatus }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = (): VerificationContextType => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};