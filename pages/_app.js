import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import "@/styles/home-page.css"
import "@/styles/editor-page.css";
import "@/styles/recipe-page.css";
import "@/styles/preferences-page.css";
export default function App({ Component, pageProps }) {
  return (
      <SessionProvider session={pageProps.session}>
        <UserPreferencesProvider>
          <Component {...pageProps} />
        </UserPreferencesProvider>
      </SessionProvider>
  );
}
