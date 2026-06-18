import { ListRestartIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useI18n } from "@/src/features/i18n/I18nProvider";

import { Button } from "@/src/components/ui/button";
import { usePersistedWindowIds } from "@/src/features/playground/page/hooks/usePersistedWindowIds";
export const ResetPlaygroundButton: React.FC = () => {
  const { t } = useI18n();

  const router = useRouter();
  const { clearAllCache } = usePersistedWindowIds();

  const handleClick = () => {
    clearAllCache();
    router.reload();
  };

  return (
    <Button
      title={t("playground.header.resetPlaygroundTitle")}
      onClick={handleClick}
      className="gap-1"
    >
      {t("playground.header.resetPlayground")}
    </Button>
  );
};
