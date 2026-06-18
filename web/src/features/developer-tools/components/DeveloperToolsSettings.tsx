import Header from "@/src/components/layouts/header";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { CodeBlock } from "@/src/components/ui/Codeblock";
import Link from "next/link";
import { Bot, SquareTerminal, Sparkles } from "lucide-react";
import { useI18n } from "@/src/features/i18n/I18nProvider";

const DocsButton = ({ href }: { href: string }) => {
  const { t } = useI18n();
  return (
    <Button asChild variant="ghost">
      <Link href={href} target="_blank">
        {t("settings.developerTools.documentation")}
      </Link>
    </Button>
  );
};

export function DeveloperToolsSettings() {
  const { t } = useI18n();
  return (
    <div>
      <Header title={t("settings.developerTools.title")} />
      <p className="text-muted-foreground mb-6 text-sm">
        {t("settings.developerTools.description")}
      </p>
      <div className="space-y-6">
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="text-foreground h-5 w-5" />
            <span className="font-semibold">
              {t("settings.developerTools.agentSkill")}
            </span>
          </div>
          <p className="text-primary mb-4 text-sm">
            {t("settings.developerTools.agentSkillDescription")}
          </p>
          <CodeBlock
            language="shell"
            value={`npx skills add langfuse/skills --skill "langfuse"`}
          />
          <div className="mt-4 flex items-center gap-2">
            <DocsButton href="https://langfuse.com/docs/api-and-data-platform/features/agent-skill" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Bot className="text-foreground h-5 w-5" />
            <span className="font-semibold">
              {t("settings.developerTools.mcpServer")}
            </span>
          </div>
          <p className="text-primary mb-4 text-sm">
            {t("settings.developerTools.mcpServerDescription")}
          </p>
          <CodeBlock
            language="shell"
            value={`claude mcp add --transport http langfuse \\
  https://cloud.langfuse.com/api/public/mcp \\
  --header "Authorization: Basic {your-base64-token}"`}
          />
          <div className="mt-4 flex items-center gap-2">
            <DocsButton href="https://langfuse.com/docs/api-and-data-platform/features/mcp-server" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <SquareTerminal className="text-foreground h-5 w-5" />
            <span className="font-semibold">
              {t("settings.developerTools.cli")}
            </span>
          </div>
          <p className="text-primary mb-4 text-sm">
            {t("settings.developerTools.cliDescription")}
          </p>
          <CodeBlock
            language="shell"
            value={`export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."

npx langfuse-cli api <resource> <action>`}
          />
          <div className="mt-4 flex items-center gap-2">
            <DocsButton href="https://langfuse.com/docs/api-and-data-platform/features/cli" />
          </div>
        </Card>
      </div>
    </div>
  );
}
