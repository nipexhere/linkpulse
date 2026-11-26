import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="mx-auto max-w-sm pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted">For the site owner only. You don&apos;t need an account to shorten links.</p>
      <div className="mt-6 rounded-xl border border-line bg-surface p-6">
        <Suspense fallback={<LoginForm />}>
          {searchParams.then(({ next }) => (
            <LoginForm next={typeof next === "string" ? next : undefined} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
