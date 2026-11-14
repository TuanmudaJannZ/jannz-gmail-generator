import { EmailInput } from "./EmailInput";
import { Stats } from "./Stats";
import { Results } from "./Results";
import { Disclaimer } from "./Disclaimer";
export function GeneratorPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Generator</h1>
      <EmailInput /><Stats /><Results /><Disclaimer />
    </div>
  );
}
