import React from "react";
import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/splash-screen";
import { FileText, GitBranch, Zap, BarChart4 } from "lucide-react";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export function PromptsOnboarding({ projectId }: { projectId: string }) {
  const { t } = useI18n();
  const valuePropositions: ValueProposition[] = [
    {
      title: t("prompts.onboarding.valueProps.decoupledTitle"),
      description: t("prompts.onboarding.valueProps.decoupledDescription"),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: t("prompts.onboarding.valueProps.editTitle"),
      description: t("prompts.onboarding.valueProps.editDescription"),
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      title: t("prompts.onboarding.valueProps.performanceTitle"),
      description: t("prompts.onboarding.valueProps.performanceDescription"),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: t("prompts.onboarding.valueProps.compareTitle"),
      description: t("prompts.onboarding.valueProps.compareDescription"),
      icon: <BarChart4 className="h-4 w-4" />,
    },
  ];

  return (
    <SplashScreen
      title={t("prompts.onboarding.title")}
      description={t("prompts.onboarding.description")}
      valuePropositions={valuePropositions}
      primaryAction={{
        label: t("prompts.onboarding.createPrompt"),
        href: `/project/${projectId}/prompts/new`,
      }}
      secondaryAction={{
        label: t("prompts.onboarding.learnMore"),
        href: "https://langfuse.com/docs/prompt-management/get-started",
      }}
    />
  );
}
