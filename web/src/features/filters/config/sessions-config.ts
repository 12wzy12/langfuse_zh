import { omitFilterFacets } from "@/src/features/filters/lib/filter-config";
import { sessionsViewCols } from "@langfuse/shared";
import type { FilterConfig } from "@/src/features/filters/lib/filter-config";
import type { ColumnToBackendKeyMap } from "@/src/features/filters/lib/filter-transform";
import { type useI18n } from "@/src/features/i18n/I18nProvider";

export type SessionOmittableFilterColumn = "userIds";

/**
 * Maps frontend column IDs to backend-expected column IDs
 * Frontend uses "tags" but backend CH mapping expects "traceTags" for trace tags on sessions table
 */
export const SESSION_COLUMN_TO_BACKEND_KEY: ColumnToBackendKeyMap = {
  tags: "traceTags",
};

export function getSessionFilterConfig(
  omittedFilter: SessionOmittableFilterColumn[] = [],
  t?: ReturnType<typeof useI18n>["t"],
): FilterConfig {
  const sessionFilterConfig: FilterConfig = {
    tableName: "sessions",

    columnDefinitions: sessionsViewCols,

    defaultExpanded: ["environment", "bookmarked"],

    facets: [
      {
        type: "categorical" as const,
        column: "environment",
        label: t ? t("sessions.list.filterLabels.environment") : "Environment",
      },
      {
        type: "string" as const,
        column: "id",
        label: t ? t("sessions.list.filterLabels.sessionId") : "Session ID",
      },
      {
        type: "categorical" as const,
        column: "userIds",
        label: t ? t("sessions.list.filterLabels.userIds") : "User IDs",
      },
      {
        type: "categorical" as const,
        column: "tags",
        label: t ? t("sessions.list.filterLabels.traceTags") : "Trace Tags",
      },
      {
        type: "boolean" as const,
        column: "bookmarked",
        label: t ? t("sessions.list.filterLabels.bookmarked") : "Bookmarked",
        trueLabel: t
          ? t("sessions.list.filterLabels.bookmarkedTrue")
          : "Bookmarked",
        falseLabel: t
          ? t("sessions.list.filterLabels.bookmarkedFalse")
          : "Not bookmarked",
      },
      {
        type: "numeric" as const,
        column: "sessionDuration",
        label: t
          ? t("sessions.list.filterLabels.sessionDuration")
          : "Session Duration",
        min: 0,
        max: 3600,
        unit: "s",
      },
      {
        type: "numeric" as const,
        column: "countTraces",
        label: t ? t("sessions.list.filterLabels.tracesCount") : "Traces Count",
        min: 0,
        max: 1000,
      },
      {
        type: "numeric" as const,
        column: "inputTokens",
        label: "Input Tokens",
        min: 0,
        max: 1000000,
      },
      {
        type: "numeric" as const,
        column: "outputTokens",
        label: "Output Tokens",
        min: 0,
        max: 1000000,
      },
      {
        type: "numeric" as const,
        column: "totalTokens",
        label: "Total Tokens",
        min: 0,
        max: 1000000,
      },
      {
        type: "numeric" as const,
        column: "inputCost",
        label: "Input Cost",
        min: 0,
        max: 100,
        unit: "$",
      },
      {
        type: "numeric" as const,
        column: "outputCost",
        label: "Output Cost",
        min: 0,
        max: 100,
        unit: "$",
      },
      {
        type: "numeric" as const,
        column: "totalCost",
        label: "Total Cost",
        min: 0,
        max: 100,
        unit: "$",
      },
      {
        type: "keyValue" as const,
        column: "score_categories",
        label: t
          ? t("sessions.list.filterLabels.categoricalScores")
          : "Categorical Scores",
      },
      {
        type: "numericKeyValue" as const,
        column: "scores_avg",
        label: t
          ? t("sessions.list.filterLabels.numericScores")
          : "Numeric Scores",
      },
      {
        type: "numeric" as const,
        column: "commentCount",
        label: t
          ? t("sessions.list.filterLabels.commentCount")
          : "Comment Count",
        min: 0,
        max: 100,
      },
      {
        type: "string" as const,
        column: "commentContent",
        label: t
          ? t("sessions.list.filterLabels.commentContent")
          : "Comment Content",
      },
    ],
  };
  return omitFilterFacets(sessionFilterConfig, omittedFilter);
}
