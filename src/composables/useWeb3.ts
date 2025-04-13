import { ref, onMounted } from 'vue';
import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

export default function useWeb3() {
    const account = ref<string | null>(null); // 明确指定 account 类型
    const isConnected = ref(false);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                // 强制声明 accounts 为 string[] 类型
                const accounts = await window.ethereum.request<string[]>({
                    method: 'eth_requestAccounts'
                });
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log('当前链 ID:', chainId);
                // Ganache: 0x539 (1337), Sepolia: 0xaa36a7 (11155111)
                if (accounts && accounts.length > 0) {
                    account.value = accounts[0];
                    isConnected.value = true;
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    onMounted(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                account.value = accounts[0] || null;
                isConnected.value = !!accounts[0];
            });
        }
    });

    return { account, isConnected, connectWallet };
}
