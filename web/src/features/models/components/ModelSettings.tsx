import Header from "@/src/components/layouts/header";
import { useI18n } from "@/src/features/i18n/I18nProvider";
import ModelTable from "@/src/components/table/use-cases/models";

export function ModelsSettings(props: { projectId: string }) {
  const { t } = useI18n();
  return (
    <>
      <Header title={t("settings.project.modelDefinitions")} />
      <p className="mb-2 text-sm">{t("settings.modelDefinitions.description")}</p>
      <ModelTable projectId={props.projectId} />
    </>
  );
}
