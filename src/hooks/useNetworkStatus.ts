// Network Status Hook — Detects online/offline state

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../store/useAppStore';

export function useNetworkStatus() {
    const setOffline = useAppStore(s => s.setOffline);
    const isOffline = useAppStore(s => s.isOffline);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = !(state.isConnected && state.isInternetReachable !== false);
            setOffline(offline);
        });

        // Initial check
        NetInfo.fetch().then(state => {
            const offline = !(state.isConnected && state.isInternetReachable !== false);
            setOffline(offline);
        });

        return () => unsubscribe();
    }, [setOffline]);

    return { isOffline };
}
