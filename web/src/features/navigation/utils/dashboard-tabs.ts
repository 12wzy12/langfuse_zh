export const DASHBOARD_TABS = {
  DASHBOARDS: "dashboards",
  WIDGETS: "widgets",
} as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[keyof typeof DASHBOARD_TABS];

type DashboardTabsTranslator = (key: string) => string;

export const getDashboardTabs = (
  projectId: string,
  t?: DashboardTabsTranslator,
) => [
  {
    value: DASHBOARD_TABS.DASHBOARDS,
    label: t ? t("dashboards.tabs.dashboards") : "Dashboards",
    href: `/project/${projectId}/dashboards`,
  },
  {
    value: DASHBOARD_TABS.WIDGETS,
    label: t ? t("dashboards.tabs.widgets") : "Widgets",
    href: `/project/${projectId}/widgets`,
  },
];
