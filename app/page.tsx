import { GuestProvider } from "./guest";
import { LangProvider } from "./i18n";
import Invitation from "./components/Invitation";

export default function Home() {
  return (
    <LangProvider>
      <GuestProvider>
        <Invitation />
      </GuestProvider>
    </LangProvider>
  );
}
