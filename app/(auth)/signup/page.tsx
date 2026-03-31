import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <p className="mt-2 text-sm text-slate-600">MVP uses demo login. Self-serve signup is deferred.</p>
      <Link className="mt-6 inline-block rounded bg-slate-900 px-4 py-2 text-white" href="/login">
        Go to login
      </Link>
    </div>
  );
}
