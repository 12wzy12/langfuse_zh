import Page from "@/src/components/layouts/page";
import { useI18n } from "@/src/features/i18n/I18nProvider";
import { BreadcrumbSeparator } from "@/src/components/ui/breadcrumb";
import { BreadcrumbPage } from "@/src/components/ui/breadcrumb";
import { BreadcrumbItem } from "@/src/components/ui/breadcrumb";
import { Check, Info } from "lucide-react";
import { cn } from "@/src/utils/tailwind";
import { BreadcrumbList } from "@/src/components/ui/breadcrumb";
import { Breadcrumb } from "@/src/components/ui/breadcrumb";
import { useRouter } from "next/router";
import { SelectEvaluatorList } from "@/src/features/evals/components/select-evaluator-list";
import { RunEvaluatorForm } from "@/src/features/evals/components/run-evaluator-form";
import { api } from "@/src/utils/api";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { getMaintainer } from "@/src/features/evals/utils/typeHelpers";
import { MaintainerTooltip } from "@/src/features/evals/components/maintainer-tooltip";
import { DefaultEvalModelSetup } from "@/src/features/evals/components/default-eval-model-setup";
import { useIsCodeEvalEnabled } from "@/src/features/evals/hooks/useIsCodeEvalEnabled";
import { shouldShowEvalTemplate } from "@/src/features/evals/utils/code-eval-template-utils";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

// Multi-step setup process
// 0. Set up default model (optional, only if no default model exists): /project/:projectId/evals/new
// 1. Select Evaluator: /project/:projectId/evals/new
// 2. Configure Evaluator: /project/:projectId/evals/new?evaluator=:evaluatorId
export default function NewEvaluatorPage() {
  const router = useRouter();
  const { t } = useI18n();
  const projectId = router.query.projectId as string;
  const evaluatorId = router.query.evaluator as string | undefined;
  const codeEvalCapabilities = useIsCodeEvalEnabled();
  const { enabled: isCodeEvalEnabled } = codeEvalCapabilities;

  const hasDefaultModelReadAccess = useHasProjectAccess({
    projectId,
    scope: "evalDefaultModel:read",
  });

  const { data: defaultModel } = api.defaultLlmModel.fetchDefaultModel.useQuery(
    { projectId },
    { enabled: hasDefaultModelReadAccess && !!projectId },
  );

  const hasDefaultModel = !!defaultModel;

  const hasAccess = useHasProjectAccess({
    projectId,
    scope: "evalTemplate:CUD",
  });

  const evalTemplates = api.evals.allTemplates.useQuery(
    {
      projectId,
      limit: 500,
      page: 0,
    },
    {
      enabled: hasAccess,
    },
  );

  const currentTemplate = evalTemplates.data?.templates
    .filter((template) =>
      shouldShowEvalTemplate(template, codeEvalCapabilities),
    )
    .find((t) => t.id === evaluatorId);

  const templatesForCurrentName = api.evals.allTemplatesForName.useQuery(
    {
      projectId,
      name: currentTemplate?.name ?? "",
      isUserManaged: Boolean(currentTemplate?.projectId),
    },
    {
      enabled: !!projectId && !!currentTemplate?.name,
      refetchOnMount: "always",
    },
  );

  const latestTemplate = templatesForCurrentName.data?.templates[0];
  const hasNewerTemplate =
    !!currentTemplate &&
    !!latestTemplate &&
    latestTemplate.id !== currentTemplate.id &&
    latestTemplate.version > currentTemplate.version;

  const handleUseUpdatedEvaluator = () => {
    if (!latestTemplate) return;

    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          evaluator: latestTemplate.id,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  // Determine starting step:
  // - Step 2: Configure evaluator (when template already selected via evaluatorId)
  // - Step 1: Select template (when default model exists or code evals enabled)
  // - Step 0: Set up default model first
  const canSkipDefaultModel = isCodeEvalEnabled || hasDefaultModel;
  const stepInt = evaluatorId ? 2 : canSkipDefaultModel ? 1 : 0;

  if (!hasAccess) {
    return <div>{t("evals.newEvaluator.noAccess")}</div>;
  }

  return (
    <Page
      withPadding
      scrollable
      headerProps={{
        title: t("evals.newEvaluator.title"),
        breadcrumb: [
          {
            name: t("evals.newEvaluator.breadcrumb"),
            href: `/project/${projectId}/evals`,
          },
        ],
      }}
    >
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          {!hasDefaultModel && (
            <>
              <BreadcrumbItem>
                <BreadcrumbPage
                  className={cn(
                    stepInt !== 0
                      ? "text-muted-foreground"
                      : "text-foreground font-semibold",
                  )}
                >
                  {t("evals.newEvaluator.step0")}
                  {stepInt > 0 && (
                    <Check className="ml-1 inline-block h-3 w-3" />
                  )}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem
            className="hover:cursor-pointer"
            onClick={() => router.push(`/project/${projectId}/evals/new`)}
          >
            <BreadcrumbPage
              className={cn(
                stepInt !== 1
                  ? "text-muted-foreground"
                  : "text-foreground font-semibold",
              )}
            >
              {t("evals.newEvaluator.step1")}
              {stepInt > 1 && <Check className="ml-1 inline-block h-3 w-3" />}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 2
                  ? "text-muted-foreground"
                  : "text-foreground font-semibold",
              )}
            >
              <div className="flex flex-row">
                {t("evals.newEvaluator.step2")}
                {currentTemplate && (
                  <div className="flex flex-row gap-2">
                    <span>
                      {currentTemplate.name ? `: ${currentTemplate.name}` : ""}
                    </span>
                    <MaintainerTooltip
                      maintainer={getMaintainer(currentTemplate)}
                    />
                  </div>
                )}
              </div>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {
        // 0. Set up default model
        stepInt === 0 && projectId && (
          <DefaultEvalModelSetup projectId={projectId} />
        )
      }
      {
        // 1. Select Evaluator
        stepInt === 1 && projectId && (
          <SelectEvaluatorList projectId={projectId} />
        )
      }
      {
        // 2. Run Evaluator
        stepInt === 2 && evaluatorId && projectId && (
          <div className="flex flex-col gap-4">
            {hasNewerTemplate && latestTemplate && currentTemplate ? (
              <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertTitle>{t("evals.newEvaluator.alertTitle")}</AlertTitle>
                <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {t("evals.newEvaluator.alertDescription", { name: latestTemplate.name })}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={handleUseUpdatedEvaluator}
                  >
                    {t("evals.newEvaluator.useUpdatedEvaluator")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            <RunEvaluatorForm
              projectId={projectId}
              evaluatorId={evaluatorId}
              evalTemplates={evalTemplates.data?.templates ?? []}
            />
          </div>
        )
      }
    </Page>
  );
}
