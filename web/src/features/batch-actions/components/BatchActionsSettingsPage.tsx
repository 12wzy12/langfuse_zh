import Header from "@/src/components/layouts/header";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { SettingsTableCard } from "@/src/components/layouts/settings-table-card";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { BatchActionsTable } from "./BatchActionsTable";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export function BatchActionsSettingsPage(props: { projectId: string }) {
  const { t } = useI18n();
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "datasets:CUD",
  });

  return (
    <>
      <Header title={t("settings.project.batchActions")} />
      <p className="mb-4 text-sm">{t("settings.batchActions.description")}</p>
      {hasAccess ? (
        <SettingsTableCard>
          <BatchActionsTable projectId={props.projectId} />
        </SettingsTableCard>
      ) : (
        <Alert>
          <AlertTitle>{t("settings.batchActions.accessDenied")}</AlertTitle>
          <AlertDescription>{t("settings.batchActions.accessDeniedDescription")}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
