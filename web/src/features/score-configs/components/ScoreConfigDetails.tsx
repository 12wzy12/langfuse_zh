import { isNumericDataType } from "@/src/features/scores/lib/helpers";
import { isPresent, type ScoreConfigDomain } from "@langfuse/shared";
import { useI18n } from "@/src/features/i18n/I18nProvider";
import React from "react";

export function ScoreConfigDetails({ config }: { config: ScoreConfigDomain }) {
  const { name, description, minValue, maxValue, dataType } = config;
  const { t } = useI18n();
  if (!description && !isPresent(minValue) && !isPresent(maxValue)) return null;
  const isNameTruncated = name.length > 20;

  return (
    <div className="bg-background p-2 text-xs font-light text-wrap">
      {!!description && <p>{t("scores.configDetails.description", { description })}</p>}
      {isNumericDataType(dataType) && (isPresent(minValue) || isPresent(maxValue)) ? (
        <p>{t("scores.configDetails.range", { min: minValue ?? "-∞", max: maxValue ?? "∞" })}</p>
      ) : null}
      {isNameTruncated && <p>{t("scores.configDetails.fullName", { name })}</p>}
    </div>
  );
}
