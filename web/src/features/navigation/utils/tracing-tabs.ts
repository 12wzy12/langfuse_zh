import { type useI18n } from "@/src/features/i18n/I18nProvider";

export const TRACING_TABS = {
  TRACES: "traces",
  OBSERVATIONS: "observations",
} as const;

export type TracingTab = (typeof TRACING_TABS)[keyof typeof TRACING_TABS];

export const getTracingTabs = (
  projectId: string,
  t?: ReturnType<typeof useI18n>["t"],
) => [
  {
    value: TRACING_TABS.TRACES,
    label: t ? t("tracing.tabs.traces") : "Traces",
    href: `/project/${projectId}/traces`,
  },
  {
    value: TRACING_TABS.OBSERVATIONS,
    label: t ? t("tracing.tabs.observations") : "Observations",
    href: `/project/${projectId}/observations`,
  },
];
