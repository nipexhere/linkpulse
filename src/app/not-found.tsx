import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="mt-2 text-sm text-muted">That link or page doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 inline-block text-sm text-accent hover:underline">
        Back home
      </Link>
    </div>
  );
}
