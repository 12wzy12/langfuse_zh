import { type useI18n } from "@/src/features/i18n/I18nProvider";

export const PROMPT_TABS = {
  VERSIONS: "versions",
  METRICS: "metrics",
} as const;

export type PromptTab = (typeof PROMPT_TABS)[keyof typeof PROMPT_TABS];

export const getPromptTabs = (
  projectId: string,
  promptName: string,
  t?: ReturnType<typeof useI18n>["t"],
) => [
  {
    value: PROMPT_TABS.VERSIONS,
    label: t ? t("prompts.tabs.versions") : "Versions",
    href: `/project/${projectId}/prompts/${encodeURIComponent(promptName)}`,
  },
  {
    value: PROMPT_TABS.METRICS,
    label: t ? t("prompts.tabs.metrics") : "Metrics",
    href: `/project/${projectId}/prompts/${encodeURIComponent(promptName)}/metrics`,
  },
];
