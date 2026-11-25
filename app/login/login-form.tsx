"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, remember }),
    });
    if (response.ok) {
      router.push("/");
      router.refresh();
      return;
    }
    const data = (await response.json()) as { error?: string };
    setError(data.error ?? "No se pudo entrar");
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="text-sm font-medium" htmlFor="password">
        Contraseña
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoFocus
        className="rounded-md border border-stone-300 px-3 py-3 text-base focus:border-indigo-500 focus:outline-none"
      />
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input
          id="remember"
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 accent-indigo-600"
        />
        Recordarme en este dispositivo
      </label>
      {error !== null && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 rounded-md bg-indigo-600 px-4 py-3 font-semibold text-[#17191c] disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
