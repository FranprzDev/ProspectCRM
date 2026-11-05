import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Entrar a ProspectCRM</h1>
        <p className="mt-1 text-sm text-stone-500">
          Solo para Fran. Si no sos él, acá no hay nada para vos.
        </p>
        {error === "1" && (
          <p className="mt-4 border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
            Contraseña incorrecta.
          </p>
        )}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
