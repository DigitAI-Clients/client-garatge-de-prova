'use client';

import { CONFIG } from '@/config/digitai.config';
import { generateThemeVariables } from '@/lib/theme-utils';

export function ThemeInjector() {
  const { colors, radius } = CONFIG.branding;

  // Càlculs es fan al render inicial (molt ràpid)
  const { lightVars, darkVars, paletteVars } = generateThemeVariables(colors.primary);

  // Convertim objectes JS a string CSS
  const cssString = (vars: Record<string, string>) => 
    Object.entries(vars).map(([key, value]) => `${key}: ${value};`).join(' ');

  // Construïm el CSS final
  const styles = `
    :root {
      ${cssString(lightVars)}
      ${cssString(paletteVars)}
      --radius: ${radius}rem;
    }

    .dark {
      ${cssString(darkVars)}
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: styles }} />
  );
}