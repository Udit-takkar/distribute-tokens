import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./components/Providers";
import { Header } from "./components/Header";
import { ToastContainer } from "react-toastify";
import { ApolloWrapper } from "@/lib/apollo-provider";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Distribute tokens",
  description: "Distribute tokens to Hats wearers using 0xsplits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ApolloWrapper>
            <Header />
            {children}
          </ApolloWrapper>
        </Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
