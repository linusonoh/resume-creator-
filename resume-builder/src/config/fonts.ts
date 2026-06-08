import { Inter, Open_Sans, Roboto, Lora, Merriweather, JetBrains_Mono, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const fontVariablesClass = `${inter.variable} ${openSans.variable} ${roboto.variable} ${lora.variable} ${merriweather.variable} ${jetbrainsMono.variable} ${outfit.variable}`;

export interface FontPairing {
  id: string;
  name: string;
  headingClass: string;
  bodyClass: string;
  description: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    headingClass: 'font-[family-name:var(--font-outfit)] font-bold tracking-tight',
    bodyClass: 'font-[family-name:var(--font-inter)]',
    description: 'Outfit headings with Inter body text.',
  },
  {
    id: 'classic-academic',
    name: 'Classic Academic',
    headingClass: 'font-[family-name:var(--font-merriweather)] font-bold tracking-normal',
    bodyClass: 'font-[family-name:var(--font-lora)]',
    description: 'Traditional academic & executive serif style with Merriweather and Lora.',
  },
  {
    id: 'professional-clean',
    name: 'Professional Clean',
    headingClass: 'font-[family-name:var(--font-open-sans)] font-bold tracking-normal',
    bodyClass: 'font-[family-name:var(--font-roboto)]',
    description: 'Clean, highly readable sans-serif layout using Open Sans and Roboto.',
  },
  {
    id: 'tech-code',
    name: 'Tech Code',
    headingClass: 'font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-wider',
    bodyClass: 'font-[family-name:var(--font-inter)]',
    description: 'Developer layout using monospaced JetBrains Mono and Inter.',
  }
];
