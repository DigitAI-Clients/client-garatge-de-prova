import { getRequestConfig } from 'next-intl/server';
import { CONFIG } from '@/config/digitai.config';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !CONFIG.i18n.locales.includes(locale)) {
        locale = CONFIG.i18n.defaultLocale;
    }

    return {
        locale,
        // ✅ FIX: Fem servir '@' per apuntar directament a src/messages
        messages: (await import(`@/messages/${locale}.json`)).default
    };
});