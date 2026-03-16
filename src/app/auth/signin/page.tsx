import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { canUseRuntimeAuth } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  if (!canUseRuntimeAuth) {
    return (
      <div className="px-4 py-12">
        <DeploymentStatusNotice
          title="Sign-in is temporarily unavailable"
          message="This deployment is missing runtime authentication or database configuration, so sign-in is disabled until the environment is fixed."
          actionHref="/deals"
          actionLabel="Browse available deals"
        />
      </div>
    );
  }

  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
