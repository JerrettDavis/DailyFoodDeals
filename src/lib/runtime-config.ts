const isProduction = process.env.NODE_ENV === "production";
const hasConfiguredDatabase = Boolean(process.env.DATABASE_URL);
const hasConfiguredAuthSecret = Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);

export const hasRuntimeDatabase = hasConfiguredDatabase || !isProduction;
export const canUseRuntimeAuth = hasRuntimeDatabase && (hasConfiguredAuthSecret || !isProduction);

export const usePublicFallbackData = isProduction && !hasConfiguredDatabase;
export const showRuntimeConfigurationNotice =
  isProduction && (!hasConfiguredDatabase || !hasConfiguredAuthSecret);
