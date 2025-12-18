import { useEffect, useRef } from 'react';

export function useWakeLock(isActive: boolean) {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        if (isActive) {
            const requestWakeLock = async () => {
                try {
                    if ('wakeLock' in navigator) {
                        wakeLockRef.current = await navigator.wakeLock.request('screen');
                        // console.log('Wake Lock active');
                    }
                } catch (err) {
                    console.warn('Wake Lock request failed:', err);
                }
            };

            requestWakeLock();

            // Re-request on visibility change (OS might release it when backgrounded)
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible' && isActive) {
                    requestWakeLock();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                if (wakeLockRef.current) {
                    wakeLockRef.current.release().catch(() => { });
                    wakeLockRef.current = null;
                }
            };
        }
    }, [isActive]);
}
