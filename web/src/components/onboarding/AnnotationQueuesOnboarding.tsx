import React from "react";
import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/splash-screen";
import { ClipboardCheck, Users, BarChart4, GitMerge } from "lucide-react";
import { CreateOrEditAnnotationQueueButton } from "@/src/features/annotation-queues/components/CreateOrEditAnnotationQueueButton";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export function AnnotationQueuesOnboarding({
  projectId,
}: {
  projectId: string;
}) {
  const { t } = useI18n();

  const valuePropositions: ValueProposition[] = [
    {
      title: t("annotationQueues.onboarding.valueProps.manageTitle"),
      description: t("annotationQueues.onboarding.valueProps.manageDescription"),
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
      title: t("annotationQueues.onboarding.valueProps.collaborateTitle"),
      description: t("annotationQueues.onboarding.valueProps.collaborateDescription"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: t("annotationQueues.onboarding.valueProps.trackTitle"),
      description: t("annotationQueues.onboarding.valueProps.trackDescription"),
      icon: <BarChart4 className="h-4 w-4" />,
    },
    {
      title: t("annotationQueues.onboarding.valueProps.baselineTitle"),
      description: t("annotationQueues.onboarding.valueProps.baselineDescription"),
      icon: <GitMerge className="h-4 w-4" />,
    },
  ];

  return (
    <SplashScreen
      title={t("annotationQueues.onboarding.title")}
      description={t("annotationQueues.onboarding.description")}
      valuePropositions={valuePropositions}
      primaryAction={{
        label: t("annotationQueues.onboarding.createQueue"),
        component: (
          <CreateOrEditAnnotationQueueButton
            variant="default"
            projectId={projectId}
            size="lg"
          />
        ),
      }}
      secondaryAction={{
        label: t("annotationQueues.onboarding.learnMore"),
        href: "https://langfuse.com/docs/scores/annotation",
      }}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/annotation-queue-overview-v1.mp4"
    />
  );
}
