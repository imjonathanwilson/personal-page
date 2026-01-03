import TerminalWindow from "./components/TerminalWindow/TerminalWindow";
import InfoContent from "./components/InfoContent/InfoContent";
import ThreeScene from "./components/ThreeScene/ThreeScene";

export default function Home() {
  return (
    <>
      <ThreeScene />
      <TerminalWindow>
        <InfoContent />
      </TerminalWindow>
    </>
  );
}
