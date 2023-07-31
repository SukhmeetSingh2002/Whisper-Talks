import '@/styles/globals.css'
import { ThemeProvider } from "@material-tailwind/react";
import { Analytics } from '@vercel/analytics/react';
 
export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}
