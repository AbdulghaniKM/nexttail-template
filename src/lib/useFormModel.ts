'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { z } from 'zod';

export interface FormModel<T extends Record<string, unknown>> {
  fields: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  setFields: (patch: Partial<T>) => void;
  setError: (key: keyof T, message: string) => void;
  validate: () => boolean;
  reset: () => void;
  submit: (handleValidatedPayload: (payload: T) => Promise<void>) => Promise<void>;
}

/**
 * Zod-backed form state with the same contract as the template's other layers:
 * the schema is the single source of truth for both types and messages.
 */
export function useFormModel<T extends Record<string, unknown>>(
  initialFields: T,
  validationSchema: z.ZodType<T>,
): FormModel<T> {
  const serializedInitialFields = useRef(JSON.stringify(initialFields)).current;

  const [fields, setFieldsState] = useState<T>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(fields) !== serializedInitialFields,
    [fields, serializedInitialFields],
  );

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFieldsState((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const setFields = useCallback((patch: Partial<T>) => {
    setFieldsState((current) => ({ ...current, ...patch }));
  }, []);

  const setError = useCallback((key: keyof T, message: string) => {
    setErrors((current) => ({ ...current, [key]: message }));
  }, []);

  const collectIssues = useCallback((): Partial<Record<keyof T, string>> => {
    const outcome = validationSchema.safeParse(fields);
    if (outcome.success) return {};
    const collected: Partial<Record<keyof T, string>> = {};
    for (const issue of outcome.error.issues) {
      const fieldKey = issue.path[0] as keyof T | undefined;
      if (fieldKey !== undefined && !collected[fieldKey]) collected[fieldKey] = issue.message;
    }
    return collected;
  }, [fields, validationSchema]);

  const validate = useCallback((): boolean => {
    const collected = collectIssues();
    setErrors(collected);
    return Object.keys(collected).length === 0;
  }, [collectIssues]);

  const reset = useCallback(() => {
    setFieldsState(JSON.parse(serializedInitialFields) as T);
    setErrors({});
  }, [serializedInitialFields]);

  const submit = useCallback(
    async (handleValidatedPayload: (payload: T) => Promise<void>) => {
      const collected = collectIssues();
      setErrors(collected);
      if (Object.keys(collected).length > 0) return;

      setIsSubmitting(true);
      try {
        await handleValidatedPayload(validationSchema.parse(fields));
      } finally {
        setIsSubmitting(false);
      }
    },
    [collectIssues, fields, validationSchema],
  );

  return {
    fields,
    errors,
    isSubmitting,
    isDirty,
    setField,
    setFields,
    setError,
    validate,
    reset,
    submit,
  };
}
