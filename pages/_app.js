import "@/styles/globals.css";
import { Provider } from  "./provider";

export default function App({ Component, pageProps }) {
  return <Provider> <Component {...pageProps} /> </Provider>;
}
