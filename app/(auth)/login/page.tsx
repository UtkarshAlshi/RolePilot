"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Use demo credentials from your environment file.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
