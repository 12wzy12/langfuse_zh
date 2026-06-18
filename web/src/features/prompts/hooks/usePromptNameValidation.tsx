import { useEffect } from "react";
import { type UseFormReturn } from "react-hook-form";

interface UsePromptNameValidationProps {
  currentName: string | undefined;
  allPrompts: { value: string }[] | undefined;
  form: UseFormReturn<any>;
  duplicateMessage?: string;
}

export const usePromptNameValidation = ({
  currentName,
  allPrompts,
  form,
  duplicateMessage = "Prompt name already exists.",
}: UsePromptNameValidationProps) => {
  useEffect(() => {
    if (!currentName || !allPrompts) return;

    const isNewPrompt = !allPrompts
      ?.map((prompt) => prompt.value)
      .includes(currentName);

    if (!isNewPrompt) {
      form.setError("name", { message: duplicateMessage });
    } else {
      const currentError = form.getFieldState("name").error;
      if (currentError?.message === duplicateMessage) {
        form.clearErrors("name");
      }
    }
  }, [currentName, allPrompts, form, duplicateMessage]);
};
