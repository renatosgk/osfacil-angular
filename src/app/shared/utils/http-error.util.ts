export function parseApiError(error: unknown): string {
  const fallback = 'Ocorreu um erro ao processar a solicitacao.';

  if (typeof error !== 'object' || !error) {
    return fallback;
  }

  const err = error as Record<string, unknown>;
  const apiError = err['error'];

  if (typeof apiError === 'string') {
    return apiError;
  }

  if (apiError && typeof apiError === 'object') {
    const errorObj = apiError as Record<string, unknown>;

    const message = errorObj['message'];
    if (typeof message === 'string') {
      return message;
    }

    const detail = errorObj['detail'];
    if (typeof detail === 'string') {
      return detail;
    }

    const title = errorObj['title'];
    if (typeof title === 'string') {
      return title;
    }

    const errors = errorObj['errors'];
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first && typeof first === 'object') {
        const firstObj = first as Record<string, unknown>;
        const firstMessage = firstObj['message'] ?? firstObj['defaultMessage'];
        if (typeof firstMessage === 'string') {
          return firstMessage;
        }
      }
    }

    const violations = errorObj['violations'];
    if (Array.isArray(violations) && violations.length > 0) {
      const first = violations[0];
      if (first && typeof first === 'object') {
        const firstObj = first as Record<string, unknown>;
        const firstMessage = firstObj['message'];
        if (typeof firstMessage === 'string') {
          return firstMessage;
        }
      }
    }
  }

  if (typeof err['message'] === 'string') {
    return err['message'] as string;
  }

  return fallback;
}
