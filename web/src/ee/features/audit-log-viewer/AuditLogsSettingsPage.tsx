import Header from "@/src/components/layouts/header";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { AuditLogsTable } from "@/src/ee/features/audit-log-viewer/AuditLogsTable";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export function AuditLogsSettingsPage(props: { projectId: string }) {
  const { t } = useI18n();
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "auditLogs:read",
  });
  const hasEntitlement = useHasEntitlement("audit-logs");

  const body = !hasEntitlement ? (
    <p className="text-muted-foreground text-sm">{t("settings.auditLogs.enterpriseFeature")}</p>
  ) : !hasAccess ? (
    <Alert>
      <AlertTitle>{t("settings.auditLogs.accessDenied")}</AlertTitle>
      <AlertDescription>{t("settings.auditLogs.contactAdmin")}</AlertDescription>
    </Alert>
  ) : (
    <AuditLogsTable scope="project" projectId={props.projectId} />
  );

  return (
    <>
      <Header title={t("settings.common.auditLogs")} />
      <p className="text-muted-foreground mb-2 text-sm">{t("settings.auditLogs.description")}</p>
      {body}
    </>
  );
}
