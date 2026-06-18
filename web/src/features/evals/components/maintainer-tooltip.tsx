import { LangfuseIcon } from "@/src/components/LangfuseLogo";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import { RagasLogoIcon } from "@/src/features/evals/components/ragas-logo";
import { UserCircle2Icon } from "lucide-react";
import { useI18n } from "@/src/features/i18n/I18nProvider";

function MaintainerIcon({ maintainer }: { maintainer: string }) {
  if (maintainer.includes("Ragas")) {
    return <RagasLogoIcon />;
  } else if (maintainer.includes("Langfuse")) {
    return <LangfuseIcon size={16} />;
  } else {
    return <UserCircle2Icon className="h-4 w-4" />;
  }
}

export function MaintainerTooltip({ maintainer }: { maintainer: string }) {
  const { t } = useI18n();
  return (
    <Tooltip>
      <TooltipTrigger>
        <MaintainerIcon maintainer={maintainer} />
      </TooltipTrigger>
      <TooltipContent>{maintainer}</TooltipContent>
    </Tooltip>
  );
}
