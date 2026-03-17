function splitAdminEmails(value: string | undefined) {
  if (!value) return [];

  return value
    .split(/[,\n;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function getConfiguredAdminEmails() {
  return [...new Set(splitAdminEmails(process.env.ADMIN_EMAILS))];
}

export function isProductionSeedEnvironment() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}
