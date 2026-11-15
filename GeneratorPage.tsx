import { EmailInput } from "./EmailInput";
import { Stats } from "./Stats";
import { Results } from "./Results";
import { Disclaimer } from "./Disclaimer";
import { useApp } from "./AppContext";
export function GeneratorPage() {
  const { t } = useApp();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl">{t("nav.generator")}</h1>
      <EmailInput /><Stats /><Results /><Disclaimer />
    </div>
  );
}
