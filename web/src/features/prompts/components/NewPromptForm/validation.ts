import { z } from "zod";
import {
  ChatMessageType,
  PlaceholderMessageSchema,
  PromptChatMessageListSchema,
  PromptNameSchema,
  TextPromptContentSchema,
  COMMIT_MESSAGE_MAX_LENGTH,
  PromptType,
} from "@langfuse/shared";
import { type useI18n } from "@/src/features/i18n/I18nProvider";

type TFunction = ReturnType<typeof useI18n>["t"];

export const createNewPromptFormSchema = (t: TFunction) => {
  const NewPromptBaseSchema = z.object({
    name: PromptNameSchema,
    isActive: z.boolean({
      error: t("prompts.new.form.validation.goLiveRequired"),
    }),
    config: z
      .string()
      .refine(validateJson, t("prompts.new.form.validation.invalidJson")),
    commitMessage: z
      .string()
      .trim()
      .max(
        COMMIT_MESSAGE_MAX_LENGTH,
        t("prompts.new.form.validation.commitMessageTooLong", {
          max: COMMIT_MESSAGE_MAX_LENGTH,
        }),
      )
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
  });

  const NewChatPromptSchema = NewPromptBaseSchema.extend({
    type: z.literal(PromptType.Chat),
    chatPrompt: z
      .array(z.any())
      .refine(
        (messages: Array<{ type?: ChatMessageType; content?: string }>) =>
          messages.every((message) => {
            const isPlaceholder = message?.type === ChatMessageType.Placeholder;
            return (
              !isPlaceholder ||
              PlaceholderMessageSchema.safeParse(message).success
            );
          }),
        t("prompts.new.form.validation.invalidPlaceholder"),
      )
      .refine(
        (messages: Array<{ type?: ChatMessageType; content?: string }>) =>
          messages.every((message) => {
            const isPlaceholder = message?.type === ChatMessageType.Placeholder;
            return isPlaceholder || Boolean(message?.content?.trim()?.length);
          }),
        t("prompts.new.form.validation.emptyChatMessage"),
      ),
    textPrompt: z.string(),
  });

  const NewTextPromptSchema = NewPromptBaseSchema.extend({
    type: z.literal(PromptType.Text),
    chatPrompt: z.array(z.any()),
    textPrompt: TextPromptContentSchema,
  });

  return z.discriminatedUnion("type", [
    NewChatPromptSchema,
    NewTextPromptSchema,
  ]);
};

export type NewPromptFormSchemaType = z.infer<
  ReturnType<typeof createNewPromptFormSchema>
>;

export const PromptVariantSchema = z.union([
  z.object({
    type: z.literal(PromptType.Chat),
    prompt: PromptChatMessageListSchema,
  }),
  z.object({
    type: z.literal(PromptType.Text),
    prompt: z.string(),
  }),
]);
export type PromptVariant = z.infer<typeof PromptVariantSchema>;

function validateJson(content: string): boolean {
  try {
    JSON.parse(content);

    return true;
  } catch (_e) {
    return false;
  }
}
