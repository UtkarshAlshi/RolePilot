import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold">AI Job Application Copilot</h1>
      <p className="mt-4 text-slate-600">Resume upload, profile vault, and trustworthy prep workspace for software engineers.</p>
      <Link className="mt-8 inline-block rounded bg-slate-900 px-4 py-2 text-white" href="/login">
        Login
      </Link>
    </div>
  );
}
