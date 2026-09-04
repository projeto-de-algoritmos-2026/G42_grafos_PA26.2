import { useState } from 'react';

const API_BASE_URL = 'http://localhost:3000/api/route';

export default function App() {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSubmitDisabled = loading || source.trim() === '' || target.trim() === '';

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);

    try {
      const query = new URLSearchParams({ source: source.trim(), target: target.trim() });
      const response = await fetch(`${API_BASE_URL}?${query.toString()}`);
      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setError(data.message || data.error || 'Não foi possível calcular a rota solicitada.');
        return;
      }

      setResult(data);
    } catch (requestError) {
      setError('Não foi possível contatar o serviço de roteamento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sistema de Roteamento Logístico
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulte o trajeto de menor distância entre dois pontos da malha.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-slate-700">
                Origem
              </label>
              <input
                id="source"
                type="text"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="Centro de Distribuicao"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="target" className="block text-sm font-medium text-slate-700">
                Destino
              </label>
              <input
                id="target"
                type="text"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="Samambaia"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Calculando...' : 'Calcular Rota'}
          </button>
        </form>

        {error !== '' && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Não foi possível traçar a rota</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {result !== null && (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Rota encontrada
              </h2>
              <p className="text-sm text-slate-500">
                Distância total
                <span className="ml-2 text-2xl font-semibold text-slate-900">
                  {Number(result.distance).toFixed(1)} km
                </span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {result.path.map((location, index) => (
                <div key={`${location}-${index}`} className="flex items-center gap-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="block text-xs font-medium text-indigo-600">
                      Parada {index + 1}
                    </span>
                    <span className="block text-sm font-medium text-slate-900">{location}</span>
                  </div>
                  {index < result.path.length - 1 && (
                    <span className="text-lg text-slate-400">&rarr;</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
