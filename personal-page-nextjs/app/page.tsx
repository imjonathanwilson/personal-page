import TerminalWindow from "./components/TerminalWindow/TerminalWindow";
import TerminalContent from "./components/TerminalWindow/TerminalContent";
import FsnSceneLoader, { FsnStoreProvider } from "./components/FsnScene";

export default function Home() {
  return (
    <FsnStoreProvider>
      <FsnSceneLoader />
      <TerminalWindow>
        <TerminalContent />
      </TerminalWindow>
    </FsnStoreProvider>
  );
}
