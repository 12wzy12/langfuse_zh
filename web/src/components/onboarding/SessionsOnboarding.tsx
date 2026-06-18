import React from "react";
import { SplashScreen } from "@/src/components/ui/splash-screen";
import { ActionButton } from "@/src/components/ActionButton";
import { useI18n } from "@/src/features/i18n/I18nProvider";

export function SessionsOnboarding() {
  const { t } = useI18n();
  return (
    <SplashScreen
      title={t("sessions.onboarding.title")}
      description={t("sessions.onboarding.description")}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/sessions-overview-v1.mp4"
    >
      <div className="mt-8">
        <h3 className="mb-4 text-2xl font-semibold">
          {t("sessions.onboarding.startTitle")}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {t("sessions.onboarding.startDescription")}
        </p>
        <ActionButton
          href="https://langfuse.com/docs/observability/features/sessions"
          variant="default"
        >
          {t("sessions.onboarding.readDocs")}
        </ActionButton>
      </div>
    </SplashScreen>
  );
}
