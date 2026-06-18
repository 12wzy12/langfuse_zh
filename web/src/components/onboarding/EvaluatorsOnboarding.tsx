import React from "react";
import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/splash-screen";
import { Bot, Gauge, Zap, BarChart4, Code2 } from "lucide-react";
import { useIsCodeEvalEnabled } from "@/src/features/evals/hooks/useIsCodeEvalEnabled";
import { EvalTemplateSourceCodeLanguage } from "@langfuse/shared";
import { useI18n } from "@/src/features/i18n/I18nProvider";

interface EvaluatorsOnboardingProps {
  projectId: string;
}

export function EvaluatorsOnboarding({ projectId }: EvaluatorsOnboardingProps) {
  const { enabled, supportedSourceCodeLanguages } = useIsCodeEvalEnabled();
  const { t } = useI18n();
  const codeEvaluatorLanguageDescription =
    supportedSourceCodeLanguages.includes(EvalTemplateSourceCodeLanguage.PYTHON)
      ? t("evals.onboarding.codeEvalLang")
      : t("evals.onboarding.codeEvalLangSingle");

  const llmAsJudgeValuePropositions: ValueProposition[] = [
    {
      title: t("evals.onboarding.propAutoEval"),
      description:
        t("evals.onboarding.propAutoEvalDesc"),
      icon: <Bot className="h-4 w-4" />,
    },
    {
      title: t("evals.onboarding.propMeasure"),
      description:
        t("evals.onboarding.propMeasureDesc"),
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      title: t("evals.onboarding.propScale"),
      description:
        t("evals.onboarding.propScaleDesc"),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: t("evals.onboarding.propTrack"),
      description:
        t("evals.onboarding.propTrackDesc"),
      icon: <BarChart4 className="h-4 w-4" />,
    },
  ];

  if (enabled) {
    const evaluatorTypes: ValueProposition[] = [
      {
        title: t("evals.onboarding.typeLlama"),
        description:
          t("evals.onboarding.typeLlamaDesc"),
        icon: <Bot className="h-4 w-4" />,
      },
      {
        title: t("evals.onboarding.typeCode"),
        description: t("evals.onboarding.typeCodeDesc", { lang: codeEvaluatorLanguageDescription }),
        icon: <Code2 className="h-4 w-4" />,
      },
    ];

    return (
      <SplashScreen
        title={t("evals.onboarding.title")}
        description={t("evals.onboarding.description")}
        valuePropositions={evaluatorTypes}
        primaryAction={{
          label: t("evals.onboarding.createEvaluator"),
          href: `/project/${projectId}/evals/new`,
        }}
        secondaryAction={{
          label: t("evals.onboarding.learnMore"),
          href: "https://langfuse.com/docs/evaluation",
        }}
      />
    );
  }

  return (
    <SplashScreen
      title={t("evals.onboarding.titleLlama")}
      description={t("evals.onboarding.descLlama")}
      valuePropositions={llmAsJudgeValuePropositions}
      primaryAction={{
        label: t("evals.onboarding.createEvaluator"),
        href: `/project/${projectId}/evals/new`,
      }}
      secondaryAction={{
        label: t("evals.onboarding.learnMore"),
        href: "https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge",
      }}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/scores-llm-as-a-judge-overview-v1.mp4"
    />
  );
}
