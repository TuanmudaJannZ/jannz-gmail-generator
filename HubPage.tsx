import { useState } from "react";
import { useApp } from "./AppContext";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { Button } from "./Button";
import { DataPanel } from "./DataPanel";
import { ExportCenter } from "./ExportCenter";
import { FavoritesPanel } from "./FavoritesPanel";
import type { Key } from "./i18n";

const TABS = [["fav", "hub.tab.fav"], ["export", "hub.tab.export"], ["stats", "hub.tab.stats"], ["data", "hub.tab.data"]] as const satisfies readonly (readonly [string, Key])[];
type Tab = (typeof TABS)[number][0];
export function HubPage() {
  const { t } = useApp();
  const [tab, setTab] = useState<Tab>("fav");
  return (
    <div className="space-y-5">
      <h1 className="text-2xl">{t("hub.title")}</h1>
      <div className="seg" role="tablist" aria-label={t("hub.title")} style={{ maxWidth: 520 }}>
        {TABS.map(([id, label]) => <Button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} variant={tab === id ? "primary" : "glass"} onClick={() => setTab(id)}>{t(label)}</Button>)}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "fav" && <FavoritesPanel />}{tab === "export" && <ExportCenter />}{tab === "stats" && <AnalyticsPanel />}{tab === "data" && <DataPanel />}
      </div>
    </div>
  );
}
