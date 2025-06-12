interface JsonObject {
  [key: string]: unknown
}

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]

export const safeJsonParse = <T extends JsonValue>(
  input: string,
  fallback: T
): T => {
  try {
    const parsed: unknown = JSON.parse(input)
    return Array.isArray(parsed) || typeof parsed === 'object'
      ? (parsed as T)
      : fallback
  } catch {
    return fallback
  }
}
