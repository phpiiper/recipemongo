import "@/styles/globals.css";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }) {
  return (
      <SessionProvider session={pageProps.session}>
        <UserPreferencesProvider>
          <Component {...pageProps} />
        </UserPreferencesProvider>
      </SessionProvider>
  );
}
