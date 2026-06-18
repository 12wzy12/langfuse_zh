import React from "react";
import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/splash-screen";
import { ThumbsUp, Star, LineChart, Code } from "lucide-react";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export function ScoresOnboarding() {
  const { t } = useI18n();
  const valuePropositions: ValueProposition[] = [
    {
      title: t("scores.onboarding.collectFeedbackTitle"),
      description: t("scores.onboarding.collectFeedbackDescription"),
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    {
      title: t("scores.onboarding.evalTitle"),
      description: t("scores.onboarding.evalDescription"),
      icon: <Star className="h-4 w-4" />,
    },
    {
      title: t("scores.onboarding.trackTitle"),
      description: t("scores.onboarding.trackDescription"),
      icon: <LineChart className="h-4 w-4" />,
    },
    {
      title: t("scores.onboarding.customTitle"),
      description: t("scores.onboarding.customDescription"),
      icon: <Code className="h-4 w-4" />,
    },
  ];

  return (
    <SplashScreen
      title={t("scores.onboarding.title")}
      description={t("scores.onboarding.description")}
      valuePropositions={valuePropositions}
      secondaryAction={{
        label: t("scores.onboarding.learnMore"),
        href: "https://langfuse.com/docs/evaluation/evaluation-methods/custom-scores",
      }}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/scores-overview-v1.mp4"
    />
  );
}
