import Hero from "components/Hero/Hero";
import Roadmap from "components/Roadmap/Roadmap";
import { ConnectedWalletListener } from "lib/base/WalletListeners";

export default function Home() {
  return (
    <>
      <ConnectedWalletListener />
      <Hero />
      <Roadmap />
    </>
  );
}
