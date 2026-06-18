import { useRouter } from "next/router";
import { useI18n } from "@/src/features/i18n/I18nProvider";
import { DatasetsTable } from "@/src/features/datasets/components/DatasetsTable";
import Page from "@/src/components/layouts/page";
import { DatasetActionButton } from "@/src/features/datasets/components/DatasetActionButton";
import { api } from "@/src/utils/api";
import { DatasetsOnboarding } from "@/src/components/onboarding/DatasetsOnboarding";
import { useQueryParam, StringParam } from "use-query-params";

export default function Datasets() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { t } = useI18n();
  const [currentFolderPath] = useQueryParam("folder", StringParam);

  // Check if the project has any datasets
  const { data: hasAnyDataset, isLoading } = api.datasets.hasAny.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );

  const showOnboarding = !isLoading && !hasAnyDataset;

  if (showOnboarding) {
    return (
      <Page
        headerProps={{
          title: t("datasets.page.title"),
          help: {
            description:
              t("datasets.page.description"),
            href: t("datasets.page.docs"),
          },
        }}
        scrollable
      >
        <DatasetsOnboarding projectId={projectId} />
      </Page>
    );
  }

  return (
    <Page
      headerProps={{
        title: t("datasets.page.title"),
        help: {
          description:
            t("datasets.page.description"),
          href: t("datasets.page.docs"),
        },
        actionButtonsRight: (
          <DatasetActionButton
            projectId={projectId}
            mode="create"
            folderPrefix={currentFolderPath || undefined}
          />
        ),
      }}
    >
      <DatasetsTable projectId={projectId} />
    </Page>
  );
}
