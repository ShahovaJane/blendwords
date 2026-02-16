export function trim(str: string | null | undefined): string {
  return str == null ? '' : String(str).trim();
}
