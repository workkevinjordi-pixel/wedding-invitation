import { LangProvider } from "./i18n";
import Invitation from "./components/Invitation";

export default function Home() {
  return (
    <LangProvider>
      <Invitation />
    </LangProvider>
  );
}
