import Header from "@/src/components/layouts/header";
import ContainerPage from "@/src/components/layouts/container-page";
import { StatusBadge } from "@/src/components/layouts/status-badge";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { PasswordInput } from "@/src/components/ui/password-input";
import { Switch } from "@/src/components/ui/switch";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import {
  blobStorageIntegrationFormSchema,
  type BlobStorageIntegrationFormSchema,
  type BlobStorageSyncStatus,
} from "@/src/features/blobstorage-integration/types";
import { deriveSyncStatus } from "@/src/features/blobstorage-integration/deriveSyncStatus";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { api } from "@/src/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/src/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import {
  BlobStorageIntegrationType,
  BlobStorageIntegrationFileType,
  BlobStorageExportMode,
  AnalyticsIntegrationExportSource,
  type BlobStorageIntegration,
  EXPORT_SOURCE_OPTIONS,
  EXPORT_FIELD_GROUP_OPTIONS,
  OBSERVATION_FIELD_GROUPS_FULL,
  type ObservationFieldGroupFull,
  isLegacyBlobExportAllowed,
  isLegacyBlobExporter,
} from "@langfuse/shared";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import { useQueryProject } from "@/src/features/projects/hooks";
import { Info, ExternalLink } from "lucide-react";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export default function BlobStorageIntegrationSettings() {
  const { t } = useI18n();
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const hasAccess = useHasProjectAccess({
    projectId,
    scope: "integrations:CRUD",
  });
  const state = api.blobStorageIntegration.get.useQuery(
    { projectId },
    {
      enabled: hasAccess,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 50 * 60 * 1000, // 50 minutes
    },
  );

  const syncStatus =
    state.isLoading || !hasAccess || !state.data?.config
      ? undefined
      : deriveSyncStatus({
          enabled: state.data.config.enabled,
          lastError: state.data.config.lastError,
          lastSyncAt: state.data.config.lastSyncAt
            ? new Date(state.data.config.lastSyncAt)
            : null,
          nextSyncAt: state.data.config.nextSyncAt
            ? new Date(state.data.config.nextSyncAt)
            : null,
        });

  const syncStatusToBadge: Record<BlobStorageSyncStatus, string> = {
    up_to_date: "active",
    queued: "queued",
    idle: "pending",
    disabled: "disabled",
    error: "error",
  };

  return (
    <ContainerPage
      headerProps={{
        title: t("settings.blobStorage.title"),
        breadcrumb: [
          { name: t("common.settings"), href: `/project/${projectId}/settings` },
        ],
        actionButtonsLeft: (
          <>
            {syncStatus && <StatusBadge type={syncStatusToBadge[syncStatus]} />}
          </>
        ),
        actionButtonsRight: (
          <Button asChild variant="secondary">
            <Link
              href="https://langfuse.com/docs/api-and-data-platform/features/export-to-blob-storage"
              target="_blank"
            >
              {t("settings.common.integrationDocs")}
            </Link>
          </Button>
        ),
      }}
    >
      <p className="text-primary mb-4 text-sm">
        {t("settings.blobStorage.description")}
      </p>
      {!hasAccess && (
        <p className="text-sm">
          {t("settings.blobStorage.noAccess")}
        </p>
      )}
      {state.data?.config && (
        <>
          <Header title={t("settings.blobStorage.status")} />
          {state.data.config.lastError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>{t("settings.blobStorage.lastExportFailed")}</AlertTitle>
              <AlertDescription>
                {state.data.config.lastError}
                {state.data.config.lastErrorAt && (
                  <>
                    <br />
                    <span className="text-xs opacity-70">
                      {new Date(state.data.config.lastErrorAt).toLocaleString()}
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          <Card className="p-3">
            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">{t("settings.blobStorage.dataExportedUpTo")}</span>
              <span>
                {state.data.config.lastSyncAt
                  ? new Date(state.data.config.lastSyncAt).toLocaleString()
                  : t("settings.blobStorage.neverPending")}
              </span>
              {state.data.config.nextSyncAt && (
                <>
                  <span className="text-muted-foreground">
                    {t("settings.blobStorage.nextExportScheduled")}
                  </span>
                  <span>
                    {new Date(state.data.config.nextSyncAt).toLocaleString()}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">{t("settings.blobStorage.exportMode")}</span>
              <span>
                {state.data.config.exportMode ===
                BlobStorageExportMode.FULL_HISTORY
                  ? t("settings.blobStorage.fullHistory")
                  : state.data.config.exportMode ===
                      BlobStorageExportMode.FROM_TODAY
                    ? t("settings.blobStorage.fromSetupDate")
                    : state.data.config.exportMode ===
                        BlobStorageExportMode.FROM_CUSTOM_DATE
                      ? t("settings.blobStorage.fromCustomDate")
                      : t("settings.blobStorage.unknown")}
              </span>
              {(state.data.config.exportMode ===
                BlobStorageExportMode.FROM_CUSTOM_DATE ||
                state.data.config.exportMode ===
                  BlobStorageExportMode.FROM_TODAY) &&
                state.data.config.exportStartDate && (
                  <>
                    <span className="text-muted-foreground">
                      {t("settings.blobStorage.exportStartDate")}
                    </span>
                    <span>
                      {new Date(
                        state.data.config.exportStartDate,
                      ).toLocaleDateString()}
                    </span>
                  </>
                )}
            </div>
          </Card>
        </>
      )}
      {hasAccess && (
        <>
          <Header title={t("settings.blobStorage.configuration")} className="mt-8" />
          <Card className="p-3">
            <BlobStorageIntegrationSettingsForm
              state={state.data?.config || undefined}
              projectId={projectId}
              isLoading={state.isLoading}
              isEnrichedExportAvailable={
                state.data?.isEnrichedExportAvailable ?? false
              }
            />
          </Card>
        </>
      )}
    </ContainerPage>
  );
}

const BlobStorageIntegrationSettingsForm = ({
  state,
  projectId,
  isLoading,
  isEnrichedExportAvailable,
}: {
  state?: Partial<BlobStorageIntegration>;
  projectId: string;
  isLoading: boolean;
  isEnrichedExportAvailable: boolean;
}) => {
  const { t } = useI18n();
  const capture = usePostHogClientCapture();
  const { isLangfuseCloud } = useLangfuseCloudRegion();
  const { project } = useQueryProject();
  const [integrationType, setIntegrationType] =
    useState<BlobStorageIntegrationType>(BlobStorageIntegrationType.S3);

  // Check if this is a self-hosted instance (no cloud region set)
  const isSelfHosted = !isLangfuseCloud;

  // Post-cutoff Cloud projects may only use OBSERVATIONS_V2 (EVENTS). The
  // Export Source field is hidden in that case; the form value is pinned to
  // EVENTS via the default below.
  const isPostCutoffCloud =
    project?.createdAt != null &&
    !isLegacyBlobExportAllowed(new Date(project.createdAt), isLangfuseCloud);
  const eventsExportAvailable = isEnrichedExportAvailable;
  // Integration-level cutoff (Cloud only): an existing row created before
  // LEGACY_BLOB_EXPORTER_CUTOFF stays legacy (picker visible); a new row (no
  // state yet) or a post-cutoff row is not legacy (picker hidden, pinned to
  // EVENTS). Stable across revisits because the row's createdAt is immutable.
  const isLegacyExporter = isLegacyBlobExporter(
    state?.createdAt ? new Date(state.createdAt) : null,
    isLangfuseCloud,
  );
  const forceEventsExport =
    isPostCutoffCloud || (eventsExportAvailable && !isLegacyExporter);
  // The picker only exists where the enriched events export is available
  // (Cloud, or self-hosted with the V4 preview opt-in — server-computed flag).
  // Where it isn't, the picker stays hidden and the form defaults to
  // TRACES_OBSERVATIONS, since EVENTS is not provisioned there.
  const showExportSourceField = eventsExportAvailable && !forceEventsExport;

  const blobStorageForm = useForm({
    resolver: zodResolver(blobStorageIntegrationFormSchema),
    defaultValues: {
      type: state?.type || BlobStorageIntegrationType.S3,
      bucketName: state?.bucketName || "",
      endpoint: state?.endpoint || null,
      region: state?.region || "",
      accessKeyId: state?.accessKeyId || "",
      secretAccessKey: state?.secretAccessKey || null,
      prefix: state?.prefix || "",
      exportFrequency: (state?.exportFrequency || "daily") as
        | "every_20_minutes"
        | "daily"
        | "weekly"
        | "hourly",
      enabled: state?.enabled || false,
      forcePathStyle: state?.forcePathStyle || false,
      fileType: state?.fileType || BlobStorageIntegrationFileType.JSONL,
      exportMode: state?.exportMode || BlobStorageExportMode.FULL_HISTORY,
      exportStartDate: state?.exportStartDate || null,
      exportSource: forceEventsExport
        ? AnalyticsIntegrationExportSource.EVENTS
        : (() => {
            const persisted = state?.exportSource;
            const isEnriched =
              persisted === AnalyticsIntegrationExportSource.EVENTS ||
              persisted ===
                AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS_EVENTS;
            if (persisted && (!isEnriched || eventsExportAvailable))
              return persisted;
            return eventsExportAvailable
              ? AnalyticsIntegrationExportSource.EVENTS
              : AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS;
          })(),
      // Empty array in the DB means "export everything" (the worker falls back
      // to all groups), so surface it as the full selection in the form.
      exportFieldGroups: state?.exportFieldGroups?.length
        ? (state.exportFieldGroups as ObservationFieldGroupFull[])
        : [...OBSERVATION_FIELD_GROUPS_FULL],
      compressed: state?.compressed ?? true,
    },
    disabled: isLoading,
  });

  useEffect(() => {
    setIntegrationType(state?.type || BlobStorageIntegrationType.S3);
    blobStorageForm.reset({
      type: state?.type || BlobStorageIntegrationType.S3,
      bucketName: state?.bucketName || "",
      endpoint: state?.endpoint || null,
      region: state?.region || "auto",
      accessKeyId: state?.accessKeyId || "",
      secretAccessKey: state?.secretAccessKey || null,
      prefix: state?.prefix || "",
      exportFrequency: (state?.exportFrequency || "daily") as
        | "every_20_minutes"
        | "daily"
        | "weekly"
        | "hourly",
      enabled: state?.enabled || false,
      forcePathStyle: state?.forcePathStyle || false,
      fileType: state?.fileType || BlobStorageIntegrationFileType.JSONL,
      exportMode: state?.exportMode || BlobStorageExportMode.FULL_HISTORY,
      exportStartDate: state?.exportStartDate || null,
      exportSource: forceEventsExport
        ? AnalyticsIntegrationExportSource.EVENTS
        : (() => {
            const persisted = state?.exportSource;
            const isEnriched =
              persisted === AnalyticsIntegrationExportSource.EVENTS ||
              persisted ===
                AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS_EVENTS;
            if (persisted && (!isEnriched || eventsExportAvailable))
              return persisted;
            return eventsExportAvailable
              ? AnalyticsIntegrationExportSource.EVENTS
              : AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS;
          })(),
      // Empty array in the DB means "export everything" (the worker falls back
      // to all groups), so surface it as the full selection in the form.
      exportFieldGroups: state?.exportFieldGroups?.length
        ? (state.exportFieldGroups as ObservationFieldGroupFull[])
        : [...OBSERVATION_FIELD_GROUPS_FULL],
      compressed: state?.compressed ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isEnrichedExportAvailable, isPostCutoffCloud]);

  const watchedExportMode = blobStorageForm.watch("exportMode");
  const watchedExportSource = blobStorageForm.watch("exportSource");
  // The legacy observations table contains fewer columns than the enriched
  // observations, so the per-group field lists differ for legacy-only exports.
  const isLegacyOnlyExport =
    watchedExportSource ===
    AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS;
  // Traces and legacy observations are only exported for the legacy and mixed
  // sources; an EVENTS-only export produces scores and enriched observations.
  const includesLegacyExport =
    watchedExportSource ===
      AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS ||
    watchedExportSource ===
      AnalyticsIntegrationExportSource.TRACES_OBSERVATIONS_EVENTS;

  const utils = api.useUtils();
  const mut = api.blobStorageIntegration.update.useMutation({
    onSuccess: () => {
      utils.blobStorageIntegration.invalidate();
    },
    onError: (error) => {
      showErrorToast("Failed to save integration", error.message);
    },
  });
  const mutDelete = api.blobStorageIntegration.delete.useMutation({
    onSuccess: () => {
      utils.blobStorageIntegration.invalidate();
    },
  });
  const mutRunNow = api.blobStorageIntegration.runNow.useMutation({
    onSuccess: () => {
      utils.blobStorageIntegration.invalidate();
    },
  });
  const mutValidate = api.blobStorageIntegration.validate.useMutation({
    onSuccess: (data) => {
      showSuccessToast({
        title: data.message,
        description: `Test file: ${data.testFileName}`,
      });
    },
    onError: (error) => {
      showErrorToast("Validation failed", error.message);
    },
  });

  async function onSubmit(values: BlobStorageIntegrationFormSchema) {
    capture("integrations:blob_storage_form_submitted");
    mut.mutate({
      projectId,
      ...values,
    });
  }

  const handleIntegrationTypeChange = (value: BlobStorageIntegrationType) => {
    setIntegrationType(value);
    blobStorageForm.setValue("type", value);
  };

  return (
    <Form {...blobStorageForm}>
      <form
        className="space-y-3"
        onSubmit={blobStorageForm.handleSubmit(onSubmit)}
      >
        <FormField
          control={blobStorageForm.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.storageProvider")}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    handleIntegrationTypeChange(
                      value as BlobStorageIntegrationType,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.blobStorage.chooseProvider")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S3">AWS S3</SelectItem>
                    <SelectItem value="S3_COMPATIBLE">
                      S3 Compatible Storage
                    </SelectItem>
                    <SelectItem value="AZURE_BLOB_STORAGE">
                      Azure Blob Storage
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {t("settings.blobStorage.chooseProvider")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="bucketName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("settings.blobStorage.containerName")
                  : t("settings.blobStorage.bucketName")}
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("settings.blobStorage.containerNameDescription")
                  : t("settings.blobStorage.bucketNameDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Endpoint URL field - Only shown for S3-compatible and Azure */}
        {integrationType !== "S3" && (
          <FormField
            control={blobStorageForm.control}
            name="endpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.blobStorage.endpointUrl")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  {integrationType === "AZURE_BLOB_STORAGE"
                    ? t("settings.blobStorage.endpointUrlDescriptionAzure")
                    : t("settings.blobStorage.endpointUrlDescriptionS3")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Region field - Only shown for AWS S3 or compatible storage */}
        {integrationType !== "AZURE_BLOB_STORAGE" && (
          <FormField
            control={blobStorageForm.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.blobStorage.region")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {integrationType === "S3"
                    ? t("settings.blobStorage.regionDescriptionS3")
                    : t("settings.blobStorage.regionDescriptionCompatible")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Force Path Style switch - Only shown for S3-compatible */}
        {integrationType === "S3_COMPATIBLE" && (
          <FormField
            control={blobStorageForm.control}
            name="forcePathStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.blobStorage.forcePathStyle")}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1 ml-4"
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.blobStorage.forcePathStyleDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={blobStorageForm.control}
          name="accessKeyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("settings.blobStorage.accessKeyIdAzure")
                  : integrationType === "S3"
                    ? t("settings.blobStorage.accessKeyIdAws")
                    : "Access Key ID"}
                {/* Show optional indicator for S3 types on self-hosted instances with entitlement */}
                {isSelfHosted && integrationType === "S3" && (
                  <span className="text-muted-foreground"> {t("settings.blobStorage.optional")}</span>
                )}
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("settings.blobStorage.accessKeyIdDescriptionAzure")
                  : integrationType === "S3"
                    ? isSelfHosted
                      ? t("settings.blobStorage.accessKeyIdDescriptionAwsSelfHosted")
                      : t("settings.blobStorage.accessKeyIdDescriptionAws")
                    : "Access key for your S3-compatible storage"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="secretAccessKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("settings.blobStorage.secretAccessKeyAzure")
                  : integrationType === "S3"
                    ? t("settings.blobStorage.secretAccessKeyAws")
                    : "Secret Access Key"}
                {/* Show optional indicator for S3 types on self-hosted instances with entitlement */}
                {isSelfHosted && integrationType === "S3" && (
                  <span className="text-muted-foreground"> {t("settings.blobStorage.optional")}</span>
                )}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********************"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("settings.blobStorage.secretAccessKeyDescriptionAzure")
                  : integrationType === "S3"
                    ? isSelfHosted
                      ? t("settings.blobStorage.secretAccessKeyDescriptionAwsSelfHosted")
                      : t("settings.blobStorage.secretAccessKeyDescriptionAws")
                    : "Secret key for your S3-compatible storage"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="prefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.exportPrefix")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {t("settings.blobStorage.exportPrefixDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="exportFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.exportFrequency")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.blobStorage.chooseProvider")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="every_20_minutes">
                      {t("settings.blobStorage.every20Minutes")}
                    </SelectItem>
                    <SelectItem value="hourly">{t("settings.blobStorage.hourly")}</SelectItem>
                    <SelectItem value="daily">{t("settings.blobStorage.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("settings.blobStorage.weekly")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {t("settings.blobStorage.exportFrequencyDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="fileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.fileType")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.blobStorage.fileType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSONL">JSONL</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {t("settings.blobStorage.fileTypeDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="exportMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.exportMode")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.blobStorage.exportMode")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BlobStorageExportMode.FULL_HISTORY}>
                      {t("settings.blobStorage.fullHistory")}
                    </SelectItem>
                    <SelectItem value={BlobStorageExportMode.FROM_TODAY}>
                      {t("settings.blobStorage.fromSetupDate")}
                    </SelectItem>
                    <SelectItem value={BlobStorageExportMode.FROM_CUSTOM_DATE}>
                      {t("settings.blobStorage.fromCustomDate")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {t("settings.blobStorage.exportModeDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {showExportSourceField && (
          <FormField
            control={blobStorageForm.control}
            name="exportSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 pt-2">
                  {t("settings.blobStorage.exportSource")}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="text-muted-foreground h-3.5 w-3.5" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[350px] space-y-2 p-3"
                    >
                      {EXPORT_SOURCE_OPTIONS.map((option) => (
                        <div key={option.value} className="space-y-0.5">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-muted-foreground text-xs">
                            {option.description}
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <a
                          href="https://langfuse.com/docs/integrations/export-sources"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          {t("settings.blobStorage.forFurtherInfo")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.blobStorage.exportSource")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPORT_SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("settings.blobStorage.exportSourceDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={blobStorageForm.control}
          name="exportFieldGroups"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.exportFieldGroups")}</FormLabel>
              <FormDescription>
                {t("settings.blobStorage.exportFieldGroupsDescription")}
                {includesLegacyExport
                  ? t("settings.blobStorage.exportFieldGroupsLegacyDesc")
                  : t("settings.blobStorage.exportFieldGroupsScoresAlways")}
              </FormDescription>
              <div className="mt-2 space-y-2">
                {EXPORT_FIELD_GROUP_OPTIONS.map((option) => {
                  const isCore = option.value === "core";
                  return (
                    <div key={option.value} className="flex items-start gap-2">
                      <Checkbox
                        id={`field-group-${option.value}`}
                        checked={
                          isCore
                            ? true
                            : (field.value ?? []).includes(option.value)
                        }
                        disabled={isCore}
                        onCheckedChange={
                          isCore
                            ? undefined
                            : (checked) => {
                                const current = field.value ?? [];
                                const next =
                                  checked === true
                                    ? current.includes(option.value)
                                      ? current
                                      : [...current, option.value]
                                    : current.filter(
                                        (v: ObservationFieldGroupFull) =>
                                          v !== option.value,
                                      );
                                field.onChange(next);
                              }
                        }
                      />
                      <label
                        htmlFor={`field-group-${option.value}`}
                        className={
                          isCore ? "space-y-0.5" : "cursor-pointer space-y-0.5"
                        }
                      >
                        <div className="text-sm leading-none font-medium">
                          {option.label}
                          {isCore && (
                            <span className="text-muted-foreground ml-1 font-normal">
                              {t("settings.blobStorage.required")}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {isLegacyOnlyExport
                            ? option.legacyDescription
                            : option.description}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
              <FormMessage>
                {blobStorageForm.formState.errors.exportFieldGroups?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {watchedExportMode === BlobStorageExportMode.FROM_CUSTOM_DATE && (
          <FormField
            control={blobStorageForm.control}
            name="exportStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.blobStorage.exportStartDate")}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      field.onChange(date);
                    }}
                    placeholder={t("settings.blobStorage.exportStartDate")}
                  />
                </FormControl>
                <FormDescription>
                  {t("settings.blobStorage.exportStartDateDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={blobStorageForm.control}
          name="compressed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.gzipCompression")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1 ml-4"
                />
              </FormControl>
              <FormDescription>
                {t("settings.blobStorage.gzipCompressionDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={blobStorageForm.control}
          name="enabled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.blobStorage.enabled")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1 ml-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <div className="mt-8 flex gap-2">
        <Button
          loading={mut.isPending}
          onClick={blobStorageForm.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {t("settings.blobStorage.save")}
        </Button>
        <Button
          variant="secondary"
          loading={mutValidate.isPending}
          disabled={isLoading || !state}
          title={t("settings.blobStorage.validateTitle")}
          onClick={() => {
            mutValidate.mutate({ projectId });
          }}
        >
          {t("settings.blobStorage.validate")}
        </Button>
        <Button
          variant="secondary"
          loading={mutRunNow.isPending}
          disabled={isLoading || !state?.enabled}
          title={t("settings.blobStorage.runNowTitle")}
          onClick={() => {
            if (
              confirm(t("settings.blobStorage.runNowConfirm"))
            )
              mutRunNow.mutate({ projectId });
          }}
        >
          {t("settings.blobStorage.runNow")}
        </Button>
        <Button
          variant="ghost"
          loading={mutDelete.isPending}
          disabled={isLoading || !!!state}
          onClick={() => {
            if (
              confirm(t("settings.blobStorage.resetConfirm"))
            )
              mutDelete.mutate({ projectId });
          }}
        >
          {t("settings.blobStorage.reset")}
        </Button>
      </div>
    </Form>
  );
};
