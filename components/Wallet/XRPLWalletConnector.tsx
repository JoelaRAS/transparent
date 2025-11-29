import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from './WalletProvider';

type Props = {
  walletManager: any;
  onConnected?: (address: string) => void;
};

export const XRPLWalletConnector: React.FC<Props> = ({ walletManager, onConnected }) => {
  const connectorRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { addEvent, showStatus } = useWallet();

  useEffect(() => {
    setIsClient(true);

    const register = async () => {
      try {
        const { WalletConnectorElement } = await import('xrpl-connect');
        if (!customElements.get('xrpl-wallet-connector')) {
          customElements.define('xrpl-wallet-connector', WalletConnectorElement);
        }
      } catch (err) {
        console.error('Failed to register xrpl wallet connector', err);
      }
    };
    register();
  }, []);

  useEffect(() => {
    if (!connectorRef.current || !walletManager) return;

    const el = connectorRef.current;
    if (typeof el.setWalletManager === 'function') {
      el.setWalletManager(walletManager);
    }

    const handleConnected = (e: any) => {
      const address = e?.detail?.account?.address;
      addEvent('Connected', e.detail);
      showStatus('Connected successfully', 'success');
      if (address && onConnected) onConnected(address);
    };
    const handleConnecting = (e: any) => {
      showStatus(`Connecting to ${e.detail?.walletId || 'wallet'}...`, 'info');
    };
    const handleError = (e: any) => {
      showStatus(`Connection failed: ${e.detail?.error?.message || 'unknown'}`, 'error');
      addEvent('Connection Error', e.detail);
    };

    el.addEventListener('connected', handleConnected);
    el.addEventListener('connecting', handleConnecting);
    el.addEventListener('error', handleError);
    // if already connected, push current account
    if (walletManager?.connected && walletManager?.account?.address && onConnected) {
      onConnected(walletManager.account.address);
    }

    return () => {
      el.removeEventListener('connected', handleConnected);
      el.removeEventListener('connecting', handleConnecting);
      el.removeEventListener('error', handleError);
    };
  }, [walletManager, onConnected]);

  if (!isClient) return null;

  return (
    <xrpl-wallet-connector
      ref={connectorRef}
      id="wallet-connector"
      wallets="xaman,crossmark,gemwallet,walletconnect"
      style={{
        '--xc-background-color': '#0A0F14',
        '--xc-background-secondary': '#111827',
        '--xc-background-tertiary': '#1f2937',
        '--xc-text-color': '#E5E7EB',
        '--xc-text-muted-color': 'rgba(229, 231, 235, 0.6)',
        '--xc-primary-color': '#00D4FF',
        '--xc-font-family': 'inherit',
        '--xc-border-radius': '12px',
        '--xc-modal-box-shadow': '0 10px 40px rgba(0, 0, 0, 0.3)',
      } as React.CSSProperties}
      primary-wallet="xaman"
    />
  );
};
