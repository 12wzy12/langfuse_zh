import { type FilterState, getGenerationLikeTypes } from "@langfuse/shared";
import {
  extractTimeSeriesData,
  fillMissingValuesAndTransform,
  isEmptyTimeSeries,
} from "@/src/features/dashboard/components/hooks";
import { DashboardCard } from "@/src/features/dashboard/components/cards/DashboardCard";
import { TabComponent } from "@/src/features/dashboard/components/TabsComponent";
import {
  type DashboardDateRangeAggregationOption,
  dashboardDateRangeAggregationSettings,
} from "@/src/utils/date-range-utils";
import { NoDataOrLoading } from "@/src/components/NoDataOrLoading";
import {
  ModelSelectorPopover,
  useModelSelection,
} from "@/src/features/dashboard/components/ModelSelector";
import { type QueryType, type ViewVersion } from "@langfuse/shared/query";
import { mapLegacyUiTableFilterToView } from "@/src/features/dashboard/lib/dashboardUiTableToViewMapping";
import type { DatabaseRow } from "@/src/server/api/services/sqlInterface";
import { Chart } from "@/src/features/widgets/chart-library/Chart";
import { timeSeriesToDataPoints } from "@/src/features/dashboard/lib/chart-data-adapters";
import { useScheduledDashboardExecuteQuery } from "@/src/hooks/useDashboardQueryScheduler";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export const GenerationLatencyChart = ({
  className,
  projectId,
  globalFilterState,
  agg,
  fromTimestamp,
  toTimestamp,
  isLoading = false,
  metricsVersion,
  schedulerId,
}: {
  className?: string;
  projectId: string;
  globalFilterState: FilterState;
  agg: DashboardDateRangeAggregationOption;
  fromTimestamp: Date;
  toTimestamp: Date;
  isLoading?: boolean;
  metricsVersion?: ViewVersion;
  schedulerId?: string;
}) => {
  const { t } = useI18n();
  const {
    allModels,
    selectedModels,
    setSelectedModels,
    isAllSelected,
    buttonText,
    handleSelectAll,
  } = useModelSelection(
    projectId,
    globalFilterState,
    fromTimestamp,
    toTimestamp,
    metricsVersion,
    {
      enabled: !isLoading,
      queryId: `${schedulerId ?? "home:generation-latency"}:all-models`,
    },
  );
  const hasModelSelection = selectedModels.length > 0 && allModels.length > 0;
  const isLatencyEnabled = !isLoading && hasModelSelection;

  const latenciesQuery: QueryType = {
    view: "observations",
    dimensions: [{ field: "providedModelName" }],
    metrics: [
      { measure: "latency", aggregation: "p50" },
      { measure: "latency", aggregation: "p75" },
      { measure: "latency", aggregation: "p90" },
      { measure: "latency", aggregation: "p95" },
      { measure: "latency", aggregation: "p99" },
    ],
    filters: [
      ...mapLegacyUiTableFilterToView("observations", globalFilterState),
      {
        column: "type",
        operator: "any of",
        value: getGenerationLikeTypes(),
        type: "stringOptions",
      },
      {
        column: "providedModelName",
        operator: "any of",
        value: selectedModels,
        type: "stringOptions",
      },
    ],
    timeDimension: {
      granularity:
        dashboardDateRangeAggregationSettings[agg].dateTrunc ?? "day",
    },
    fromTimestamp: fromTimestamp.toISOString(),
    toTimestamp: toTimestamp.toISOString(),
    orderBy: null,
  };

  const latencies = useScheduledDashboardExecuteQuery(
    {
      projectId,
      query: latenciesQuery,
      version: metricsVersion,
    },
    {
      enabled: isLatencyEnabled,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
      queryId: `${schedulerId ?? "home:generation-latency"}:latencies`,
      priority: 1001,
    },
  );

  const getData = (valueColumn: string) => {
    return latencies.data && selectedModels.length > 0
      ? fillMissingValuesAndTransform(
          extractTimeSeriesData(
            latencies.data as DatabaseRow[],
            "time_dimension",
            [
              {
                uniqueIdentifierColumns: [{ accessor: "providedModelName" }],
                valueColumn: valueColumn,
              },
            ],
          ),
          selectedModels,
        )
      : [];
  };

  const data = [
    {
      tabTitle: t("home.dashboard.charts.percentile50"),
      data: getData("p50_latency"),
    },
    {
      tabTitle: t("home.dashboard.charts.percentile75"),
      data: getData("p75_latency"),
    },
    {
      tabTitle: t("home.dashboard.charts.percentile90"),
      data: getData("p90_latency"),
    },
    {
      tabTitle: t("home.dashboard.charts.percentile95"),
      data: getData("p95_latency"),
    },
    {
      tabTitle: t("home.dashboard.charts.percentile99"),
      data: getData("p99_latency"),
    },
  ];

  return (
    <DashboardCard
      className={className}
      title={t("home.dashboard.charts.modelLatencies")}
      description={t("home.dashboard.charts.modelLatenciesDescription")}
      isLoading={
        isLoading || (latencies.isPending && selectedModels.length > 0)
      }
      headerRight={
        <div className="flex items-center justify-end">
          <ModelSelectorPopover
            allModels={allModels}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            buttonText={buttonText}
            isAllSelected={isAllSelected}
            handleSelectAll={handleSelectAll}
          />
        </div>
      }
    >
      <TabComponent
        tabs={data.map((item) => {
          return {
            tabTitle: item.tabTitle,
            content: (
              <>
                {!isEmptyTimeSeries({ data: item.data }) ? (
                  <div className="h-80 w-full shrink-0">
                    <Chart
                      chartType="LINE_TIME_SERIES"
                      data={timeSeriesToDataPoints(item.data, agg)}
                      config={{
                        metric: {
                          label: t("home.dashboard.charts.latency"),
                        },
                      }}
                      rowLimit={100}
                      chartConfig={{
                        type: "LINE_TIME_SERIES",
                        unit: "millisecond",
                        show_data_point_dots: false,
                      }}
                      legendPosition="above"
                    />
                  </div>
                ) : (
                  <NoDataOrLoading
                    isLoading={isLoading || latencies.isPending}
                  />
                )}
              </>
            ),
          };
        })}
      />
    </DashboardCard>
  );
};
