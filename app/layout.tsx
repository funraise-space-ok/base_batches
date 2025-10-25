import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import AppTheme from "components/AppTheme/AppTheme";
import AppBar from "components/AppBar/AppBar";
import Footer from "components/Footer";
import ReactQueryProvider from "components/ReactQueryProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { BaseWalletProvider } from "lib/base/BaseWalletProvider";
export const metadata: Metadata = {
  title: "Funraise Sports | Back Real Athletes. Play for Real Rewards",
  description: "Back Real Athletes. Play for Real Rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="preload" as="image" href="/booster_pack.png" />
        <link rel="preload" as="image" href="/field.png" />
      </head>
      <body style={{ margin: 0 }}>
        <AppRouterCacheProvider>
          <AppTheme>
            <BaseWalletProvider>
              <ReactQueryProvider>
                <>
                  <AppBar />
                  <div>
                    {children}
                    <Footer />
                  </div>
                </>
              </ReactQueryProvider>
            </BaseWalletProvider>
          </AppTheme>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
