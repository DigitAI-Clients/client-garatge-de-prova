// src/lib/theme-utils.ts

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 }; 

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s; const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const toHslString = (h: number, s: number, l: number) => `${h} ${s}% ${l}%`;

export function generateThemeVariables(primaryHex: string) {
  const { h, s, l } = hexToHsl(primaryHex);

  // Generem una paleta tintada
  const sTint = Math.max(5, Math.floor(s * 0.2)); 

  const palette = {
    50:  toHslString(h, sTint, 98),
    100: toHslString(h, sTint, 94),
    500: toHslString(h, s, l),       
    900: toHslString(h, sTint, 15),
  };

  // 🌞 LIGHT MODE (Blanc Net)
  const lightVars = {
    '--background': '0 0% 100%',
    '--foreground': '222 47% 11%',     // Slate-900
    '--card': '0 0% 100%',
    '--card-foreground': '222 47% 11%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222 47% 11%',
    '--primary': palette[500],
    '--primary-foreground': l > 60 ? '222 47% 11%' : '0 0% 98%',
    '--secondary': '210 40% 96.1%',    // Slate-100
    '--secondary-foreground': '222 47% 11%',
    '--muted': '210 40% 96.1%',
    '--muted-foreground': '215.4 16.3% 46.9%', // Slate-500
    '--accent': '210 40% 96.1%',
    '--accent-foreground': '222 47% 11%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '214.3 31.8% 91.4%',   // Slate-200
    '--input': '214.3 31.8% 91.4%',
    '--ring': palette[500],
  };

  // 🌙 DARK MODE (Grisos Elegants - No Negre)
  // Utilitzem la gamma "Slate" de Tailwind com a base per al Dark Mode
  const darkVars = {
    '--background': '222 47% 11%',     // Slate-950 (Fons Base)
    '--foreground': '210 40% 98%',     // Slate-50
    '--card': '217 33% 17%',           // Slate-900 (Targetes lleugerament més clares)
    '--card-foreground': '210 40% 98%',
    '--popover': '217 33% 17%',
    '--popover-foreground': '210 40% 98%',
    '--primary': palette[500],         // Mantenim el color de marca
    '--primary-foreground': l > 60 ? '222 47% 11%' : '0 0% 98%',
    '--secondary': '217 33% 17%',      // Slate-800/900
    '--secondary-foreground': '210 40% 98%',
    '--muted': '217 33% 17%',
    '--muted-foreground': '215 20.2% 65.1%', // Slate-400
    '--accent': '217 33% 17%',
    '--accent-foreground': '210 40% 98%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '217 33% 17%',         // Vores suaus
    '--input': '217 33% 17%',
    '--ring': '212.7 26.8% 83.9%',     // Slate-300
  };

  return { lightVars, darkVars, paletteVars: {} };
}