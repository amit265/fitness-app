import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export function useDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;

      try {
        const parsed = new URL(url);
        const path = parsed.pathname;

        if (path.includes('/cycle')) {
          router.push('/cycle');
        } else if (path.includes('/bmi')) {
          router.push('/bmi');
        } else if (path.includes('/settings')) {
          router.push('/settings');
        } else if (path.includes('/edit-profile')) {
          router.push('/edit-profile');
        }
      } catch (err) {
        // Simple scheme link format parsing (e.g. aurafit://cycle)
        if (url.includes('cycle')) {
          router.push('/cycle');
        } else if (url.includes('bmi')) {
          router.push('/bmi');
        } else if (url.includes('settings')) {
          router.push('/settings');
        }
      }
    };

    // 1. Cold start deep link check
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // 2. Foreground deep link listener
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
}
