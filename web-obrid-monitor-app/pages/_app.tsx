import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Noto_Sans_JP } from "next/font/google";

const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={noto.className}>
      <Component {...pageProps} />
    </div>
  );
}
