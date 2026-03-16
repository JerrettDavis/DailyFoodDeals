import { SignUpForm } from "@/components/auth/SignUpForm";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { canUseRuntimeAuth } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!canUseRuntimeAuth) {
    return (
      <div className="px-4 py-12">
        <DeploymentStatusNotice
          title="Sign-up is temporarily unavailable"
          message="This deployment is missing runtime authentication or database configuration, so account creation is disabled until the environment is fixed."
          actionHref="/deals"
          actionLabel="Browse available deals"
        />
      </div>
    );
  }

  return <SignUpForm />;
}
