import React from "react";
import { useI18n } from "@/src/features/i18n/I18nProvider";
import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/splash-screen";
import { Database, Beaker, Zap, Code } from "lucide-react";
import { DatasetActionButton } from "@/src/features/datasets/components/DatasetActionButton";

export function DatasetsOnboarding({ projectId }: { projectId: string }) {
  const { t } = useI18n();
  const valuePropositions: ValueProposition[] = [
    {
      title: t("datasets.onboarding.valueProps.continuousTitle"),
      description: t("datasets.onboarding.valueProps.continuousDescription"),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: t("datasets.onboarding.valueProps.testingTitle"),
      description: t("datasets.onboarding.valueProps.testingDescription"),
      icon: <Beaker className="h-4 w-4" />,
    },
    {
      title: t("datasets.onboarding.valueProps.structuredTitle"),
      description: t("datasets.onboarding.valueProps.structuredDescription"),
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: t("datasets.onboarding.valueProps.customWorkflowsTitle"),
      description: t("datasets.onboarding.valueProps.customWorkflowsDescription"),
      icon: <Code className="h-4 w-4" />,
    },
  ];

  return (
    <SplashScreen
      title={t("datasets.onboarding.title")}
      description={t("datasets.onboarding.description")}
      valuePropositions={valuePropositions}
      primaryAction={{
        label: t("datasets.onboarding.createDataset"),
        component: (
          <DatasetActionButton
            variant="default"
            mode="create"
            projectId={projectId}
            size="lg"
          />
        ),
      }}
      secondaryAction={{
        label: t("datasets.onboarding.learnMore"),
        href: "https://langfuse.com/docs/datasets",
      }}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/datasets-overview-v1.mp4"
    />
  );
}
