"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { wagmiConfig } from '../wagmi';
import "@coinbase/onchainkit/styles.css";

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}