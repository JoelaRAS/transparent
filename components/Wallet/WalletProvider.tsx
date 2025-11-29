import React, { createContext, useCallback, useContext, useState } from 'react';

type StatusType = 'success' | 'error' | 'warning' | 'info';

type WalletContextType = {
  walletManager: any;
  walletAddress: string | null;
  walletName: string | null;
  isConnected: boolean;
  accountInfo: any;
  events: Array<{ timestamp: string; name: string; data: any }>;
  statusMessage: { message: string; type: StatusType } | null;
  setWalletManager: (manager: any) => void;
  setWalletAddress: (addr: string | null) => void;
  setWalletName: (name: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setAccountInfo: (info: any) => void;
  addEvent: (name: string, data: any) => void;
  clearEvents: () => void;
  showStatus: (message: string, type: StatusType) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletManager, setWalletManager] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [events, setEvents] = useState<Array<{ timestamp: string; name: string; data: any }>>([]);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: StatusType } | null>(null);

  const addEvent = useCallback((name: string, data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [{ timestamp, name, data }, ...prev]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const showStatus = useCallback((message: string, type: StatusType) => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletManager,
        walletAddress,
        walletName,
        isConnected,
        accountInfo,
        events,
        statusMessage,
        setWalletManager,
        setWalletAddress,
        setWalletName,
        setIsConnected,
        setAccountInfo,
        addEvent,
        clearEvents,
        showStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
};
