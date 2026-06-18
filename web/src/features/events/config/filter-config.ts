import { eventsTableCols, type FilterState } from "@langfuse/shared";
import {
  omitFilterFacets,
  type FilterConfig,
} from "@/src/features/filters/lib/filter-config";
import type { ColumnToBackendKeyMap } from "@/src/features/filters/lib/filter-transform";
import { renderFilterIcon } from "@/src/components/ItemBadge";
import { type useI18n } from "@/src/features/i18n/I18nProvider";

// Helper function to get column name from eventsTableCols by ID
export const getEventsColumnName = (
  id: string,
  t?: ReturnType<typeof useI18n>["t"],
): string => {
  const translationMap: Record<string, string> = {
    startTime: "tracing.events.columns.startTime",
    type: "tracing.events.columns.type",
    name: "tracing.events.columns.name",
    traceName: "tracing.events.columns.traceName",
    input: "tracing.events.columns.input",
    output: "tracing.events.columns.output",
    metadata: "tracing.events.columns.metadata",
    level: "tracing.events.columns.level",
    statusMessage: "tracing.events.columns.statusMessage",
    latency: "tracing.events.columns.latency",
    totalCost: "tracing.events.columns.totalCost",
    inputCost: "tracing.events.columns.inputCost",
    outputCost: "tracing.events.columns.outputCost",
    toolDefinitions: "tracing.events.columns.toolDefinitions",
    toolCalls: "tracing.events.columns.toolCalls",
    timeToFirstToken: "tracing.events.columns.timeToFirstToken",
    inputTokens: "tracing.events.columns.inputTokens",
    outputTokens: "tracing.events.columns.outputTokens",
    totalTokens: "tracing.events.columns.totalTokens",
    providedModelName: "tracing.events.columns.providedModelName",
    promptName: "tracing.events.columns.promptName",
    environment: "tracing.events.columns.environment",
    traceTags: "tracing.events.columns.traceTags",
    endTime: "tracing.events.columns.endTime",
    traceId: "tracing.events.columns.traceId",
    modelId: "tracing.events.columns.modelId",
    version: "tracing.events.columns.version",
    userId: "tracing.events.columns.userId",
    sessionId: "tracing.events.columns.sessionId",
  };

  const translationKey = translationMap[id];
  if (t && translationKey) {
    return t(translationKey);
  }

  const column = eventsTableCols.find((col) => col.id === id);
  if (!column) {
    throw new Error(`Column ${id} not found in eventsTableCols`);
  }
  return column.name;
};

/**
 * Maps frontend column IDs to backend-expected column IDs for events table
 * Events table uses different naming conventions than observations table
 */
export const OBSERVATION_EVENTS_COLUMN_TO_BACKEND_KEY: ColumnToBackendKeyMap = {
  // No mapping needed currently - events table column names align with UI
};

const isBooleanEqualityOperator = (operator: string): operator is "=" | "<>" =>
  operator === "=" || operator === "<>";

export const migrateLegacyRootObservationFilters = (
  filters: FilterState,
): FilterState => {
  const hasRootObservationFilter = filters.some(
    (filter) =>
      filter.column === "isRootObservation" &&
      filter.type === "boolean" &&
      isBooleanEqualityOperator(filter.operator),
  );

  return filters.flatMap((filter) => {
    if (
      filter.column === "isRootObservation" &&
      filter.type === "boolean" &&
      isBooleanEqualityOperator(filter.operator)
    ) {
      return [
        {
          ...filter,
          operator: "=" as const,
          value: filter.operator === "<>" ? !filter.value : filter.value,
        },
      ];
    }

    if (
      (filter.column === "hasParentObservation" ||
        filter.column === "Has Parent Observation") &&
      filter.type === "boolean" &&
      isBooleanEqualityOperator(filter.operator)
    ) {
      if (hasRootObservationFilter) {
        return [];
      }

      return [
        {
          ...filter,
          column: "isRootObservation",
          operator: "=" as const,
          value: filter.operator === "=" ? !filter.value : filter.value,
        },
      ];
    }

    return [filter];
  });
};

export type ObservationEventsOmittableFilterColumn = "sessionId" | "userId";

export const getObservationEventsFilterConfig = (
  omittedFilter: ObservationEventsOmittableFilterColumn[] = [],
  t?: ReturnType<typeof useI18n>["t"],
): FilterConfig => {
  const observationEventsFilterConfig: FilterConfig = {
    tableName: "observations-events",

    columnDefinitions: eventsTableCols,

    defaultExpanded: ["environment", "name", "isRootObservation", "type"],

    migrateFilterState: migrateLegacyRootObservationFilters,

    facets: [
      {
        type: "categorical" as const,
        column: "environment",
        label: getEventsColumnName("environment", t),
      },
      {
        type: "categorical" as const,
        column: "type",
        label: getEventsColumnName("type", t),
        renderIcon: renderFilterIcon,
      },
      {
        type: "boolean" as const,
        column: "isRootObservation",
        label: t
          ? t("tracing.events.filters.isRootObservation")
          : "Is Root Observation",
        tooltip: t
          ? t("tracing.events.filters.isRootObservationTooltip")
          : "A root observation is top-level in a trace or marked as an app root by the SDK. Filter to 'True' to see root-level observations.",
      },
      {
        type: "categorical" as const,
        column: "traceName",
        label: getEventsColumnName("traceName", t),
      },
      {
        type: "categorical" as const,
        column: "name",
        label: getEventsColumnName("name", t),
      },
      {
        type: "categorical" as const,
        column: "level",
        label: getEventsColumnName("level", t),
      },
      {
        type: "categorical" as const,
        column: "providedModelName",
        label: getEventsColumnName("providedModelName", t),
      },
      {
        type: "categorical" as const,
        column: "modelId",
        label: getEventsColumnName("modelId", t),
      },
      {
        type: "categorical" as const,
        column: "promptName",
        label: getEventsColumnName("promptName", t),
      },
      {
        type: "categorical" as const,
        column: "traceTags",
        label: getEventsColumnName("traceTags", t),
      },
      {
        type: "stringKeyValue" as const,
        column: "metadata",
        label: getEventsColumnName("metadata", t),
      },
      {
        type: "categorical" as const,
        column: "version",
        label: getEventsColumnName("version", t),
      },
      {
        type: "string" as const,
        column: "statusMessage",
        label: getEventsColumnName("statusMessage", t),
      },
      {
        type: "string" as const,
        column: "traceId",
        label: getEventsColumnName("traceId", t),
      },
      {
        type: "categorical" as const,
        column: "sessionId",
        label: getEventsColumnName("sessionId", t),
      },
      {
        type: "categorical" as const,
        column: "userId",
        label: getEventsColumnName("userId", t),
      },
      {
        type: "categorical" as const,
        column: "experimentDatasetId",
        label: getEventsColumnName("experimentDatasetId"),
      },
      {
        type: "categorical" as const,
        column: "experimentId",
        label: getEventsColumnName("experimentId"),
      },
      {
        type: "categorical" as const,
        column: "experimentName",
        label: getEventsColumnName("experimentName"),
      },
      {
        type: "numeric" as const,
        column: "latency",
        label: getEventsColumnName("latency", t),
        min: 0,
        max: 60,
        unit: "s",
      },
      {
        type: "numeric" as const,
        column: "timeToFirstToken",
        label: getEventsColumnName("timeToFirstToken", t),
        min: 0,
        max: 60,
        unit: "s",
      },
      {
        type: "numeric" as const,
        column: "inputTokens",
        label: getEventsColumnName("inputTokens", t),
        min: 0,
        max: 1000000,
      },
      {
        type: "numeric" as const,
        column: "outputTokens",
        label: getEventsColumnName("outputTokens", t),
        min: 0,
        max: 1000000,
      },
      {
        type: "numeric" as const,
        column: "totalTokens",
        label: getEventsColumnName("totalTokens", t),
        min: 0,
        max: 1000000,
      },
      {
        type: "numeric" as const,
        column: "inputCost",
        label: getEventsColumnName("inputCost", t),
        min: 0,
        max: 100,
        unit: "$",
      },
      {
        type: "numeric" as const,
        column: "outputCost",
        label: getEventsColumnName("outputCost", t),
        min: 0,
        max: 100,
        unit: "$",
      },
      {
        type: "numeric" as const,
        column: "totalCost",
        label: getEventsColumnName("totalCost", t),
        min: 0,
        max: 100,
        unit: "$",
      },
      {
        type: "categorical" as const,
        column: "toolNames",
        label: t
          ? t("tracing.events.filters.toolNamesAvailable")
          : "Tool Names (Available)",
      },
      {
        type: "categorical" as const,
        column: "calledToolNames",
        label: t
          ? t("tracing.events.filters.toolNamesCalled")
          : "Tool Names (Called)",
      },
      {
        type: "numeric" as const,
        column: "toolDefinitions",
        label: getEventsColumnName("toolDefinitions", t),
        min: 0,
        max: 25,
      },
      {
        type: "numeric" as const,
        column: "toolCalls",
        label: getEventsColumnName("toolCalls", t),
        min: 0,
        max: 25,
      },
      {
        type: "keyValue" as const,
        column: "score_categories",
        label: t
          ? t("tracing.events.filters.categoricalScores")
          : "Categorical Scores",
      },
      {
        type: "numericKeyValue" as const,
        column: "scores_avg",
        label: t ? t("tracing.events.filters.numericScores") : "Numeric Scores",
      },
      {
        type: "keyValue" as const,
        column: "trace_score_categories",
        label: t
          ? t("tracing.events.filters.traceCategoricalScores")
          : "Trace Categorical Scores",
      },
      {
        type: "numericKeyValue" as const,
        column: "trace_scores_avg",
        label: t
          ? t("tracing.events.filters.traceNumericScores")
          : "Trace Numeric Scores",
      },
      {
        type: "numeric" as const,
        column: "commentCount",
        label: t ? t("tracing.events.filters.commentCount") : "Comment Count",
        min: 0,
        max: 100,
      },
      {
        type: "string" as const,
        column: "commentContent",
        label: t
          ? t("tracing.events.filters.commentContent")
          : "Comment Content",
      },
    ],
  };
  return omitFilterFacets(observationEventsFilterConfig, omittedFilter);
};
