import { Card } from "@/src/components/ui/card";
import { CodeView } from "@/src/components/ui/CodeJsonViewer";
import Header from "@/src/components/layouts/header";
import { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";
import { useI18n } from "@/src/features/i18n/I18nProvider";
import { env } from "@/src/env.mjs";

export function HostNameProject() {
  const uiCustomization = useUiCustomization();
  const { t } = useI18n();
  return (
    <div>
      <Header title={t("settings.project.hostName")} />
      <Card className="mb-4 p-3">
        <div className="">
          <div className="mb-2 text-sm">{t("settings.hostName.description")}</div>
          <CodeView
            content={`${uiCustomization?.hostname ?? window.origin}${env.NEXT_PUBLIC_BASE_PATH ?? ""}`}
          />
        </div>
      </Card>
    </div>
  );
}
