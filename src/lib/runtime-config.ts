import { getAuthSecret } from "./auth-env";
import { hasUsableDatabaseConfig } from "./database-config";

const isProduction = process.env.NODE_ENV === "production";
const hasConfiguredDatabase = hasUsableDatabaseConfig();
const hasConfiguredAuthSecret = Boolean(getAuthSecret());

export const hasRuntimeDatabase = hasConfiguredDatabase || !isProduction;
export const canUseRuntimeAuth = hasRuntimeDatabase && (hasConfiguredAuthSecret || !isProduction);

export const usePublicFallbackData = isProduction && !hasConfiguredDatabase;
export const showRuntimeConfigurationNotice =
  isProduction && (!hasConfiguredDatabase || !hasConfiguredAuthSecret);
