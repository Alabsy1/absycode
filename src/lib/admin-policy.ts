/**
 * The single policy for "is this identity an admin?".
 * Role comes ONLY from app_metadata.role — never user_metadata. Shared by the
 * login action, requireAdmin(), and unit tests.
 */
export function isAdminIdentity(
  appMetadata: Record<string, unknown> | null | undefined,
): boolean {
  return (appMetadata?.role as unknown) === "admin";
}