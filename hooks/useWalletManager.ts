import { useEffect } from 'react';
import { Buffer } from 'buffer';
import process from 'process';
import { useWallet } from '../components/Wallet/WalletProvider';

export const useWalletManager = () => {
  const {
    walletManager,
    walletAddress,
    walletName,
    setWalletManager,
    setWalletAddress,
    setWalletName,
    setIsConnected,
    setAccountInfo,
    addEvent,
    showStatus,
  } = useWallet();

  useEffect(() => {
    let manager: any;
    const init = async () => {
      try {
        // Polyfills required by xrpl-connect in Vite
        (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;
        (globalThis as any).process = (globalThis as any).process || process;
        (globalThis as any).global = (globalThis as any).global || globalThis;

        const {
          WalletManager,
          CrossmarkAdapter,
          GemWalletAdapter,
          XamanAdapter,
          WalletConnectAdapter,
        } = await import('xrpl-connect');

        const adapters = [new CrossmarkAdapter(), new GemWalletAdapter()];
        const xamanKey = import.meta.env.VITE_XAMAN_API_KEY || import.meta.env.NEXT_PUBLIC_XAMAN_API_KEY;
        const wcId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        if (xamanKey) adapters.push(new XamanAdapter({ apiKey: xamanKey }));
        if (wcId) adapters.push(new WalletConnectAdapter({ projectId: wcId }));

        manager = new WalletManager({
          adapters,
          network: 'testnet',
          autoConnect: true,
          logger: { level: 'info' },
        });

        manager.on('connect', (account: any) => {
          setWalletAddress(account.address);
          setWalletName(manager.wallet?.name || null);
          setIsConnected(true);
          setAccountInfo({
            address: account.address,
            network: `${account.network?.name || ''} (${account.network?.id || ''})`,
            walletName: manager.wallet?.name || null,
          });
          addEvent('Connected', account);
          showStatus('Connected successfully', 'success');
        });

        manager.on('disconnect', () => {
          setWalletAddress(null);
          setWalletName(null);
          setIsConnected(false);
          setAccountInfo(null);
          addEvent('Disconnected', null);
          showStatus('Wallet disconnected', 'info');
        });

        manager.on('error', (error: any) => {
          addEvent('Error', error);
          showStatus(error.message || 'Wallet error', 'error');
        });

        setWalletManager(manager);
        if (!manager.connected) {
          showStatus('Please connect a wallet', 'info');
        }
      } catch (err) {
        console.error('Failed to init wallet manager', err);
        setWalletManager(null);
        showStatus('Failed to initialize wallet manager', 'error');
      }
    };

    init();
    return () => {
      if (manager?.removeAllListeners) {
        manager.removeAllListeners();
      }
    };
  }, [setWalletManager, setWalletAddress, setWalletName, setIsConnected, setAccountInfo, addEvent, showStatus]);

  return { walletManager, walletAddress, walletName, setWalletAddress };
};
