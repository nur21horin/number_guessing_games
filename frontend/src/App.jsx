import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

function App() {
  const [screen, setScreen] = useState('start')
  const [form, setForm] = useState({ start: 1, end: 100 })
  const [game, setGame] = useState(null)
  const [error, setError] = useState('')

  async function startGame() {
    setError('')

    const response = await fetch(`${API_BASE}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: Number(form.start),
        end: Number(form.end),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.detail || 'Unable to start the game.')
      return
    }

    setGame(data)
    setScreen('guess')
  }

  async function sendAnswer(answer) {
    if (!game?.game_id) return

    const response = await fetch(`${API_BASE}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: game.game_id,
        answer,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.detail || 'Something went wrong.')
      return
    }

    setError('')

    if (data.status === 'won' || data.status === 'lost') {
      setGame(data)
      setScreen('result')
      return
    }

    setGame(data)
  }

  function resetGame() {
    setGame(null)
    setScreen('start')
    setError('')
  }

  const isGuessing = screen === 'guess' && game && (game.status === 'guess' || game.status === 'compare')

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_22px_60px_rgba(2,6,23,0.5)] sm:p-8">
        {screen === 'start' && (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-500">Number Guessing Game</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Think of a number and I&apos;ll try to guess it.</h1>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Start</span>
                <input
                  type="number"
                  value={form.start}
                  onChange={(event) => setForm({ ...form, start: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-lg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-violet-500/30"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">End</span>
                <input
                  type="number"
                  value={form.end}
                  onChange={(event) => setForm({ ...form, end: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-lg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-violet-500/30"
                />
              </label>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

            <button
              type="button"
              onClick={startGame}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Start Game
            </button>
          </div>
        )}

        {isGuessing && (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              {game.status === 'compare' ? (
                <>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-500">Question</p>
                  <h2 className="text-3xl font-semibold">Is your number greater than {game.guess}?</h2>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-500">Guess</p>
                  <h2 className="text-3xl font-semibold">Is your number...</h2>
                </>
              )}
            </div>

            {game.status !== 'compare' && (
              <div className="rounded-2xl bg-slate-100 px-6 py-8 text-center text-5xl font-bold text-slate-900 shadow-inner dark:bg-slate-800 dark:text-white">
                {game.guess}
              </div>
            )}

            <div className="space-y-3">
              {game.status === 'compare' ? (
                <>
                  <button
                    type="button"
                    onClick={() => sendAnswer('greater')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-800 transition hover:border-violet-500 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-violet-400 dark:hover:bg-slate-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => sendAnswer('less')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-800 transition hover:border-violet-500 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-violet-400 dark:hover:bg-slate-700"
                  >
                    No
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => sendAnswer('yes')}
                    className="w-full rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
                  >
                    Yes, that&apos;s my number
                  </button>
                  <button
                    type="button"
                    onClick={() => sendAnswer('no')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-800 transition hover:border-violet-500 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-violet-400 dark:hover:bg-slate-700"
                  >
                    No
                  </button>
                </>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <p>Attempt: {game.attempts}</p>
              <p>
                Possible range: {game.possible_range[0]} - {game.possible_range[1]}
              </p>
            </div>
          </div>
        )}

        {screen === 'result' && game && (
          <div className="space-y-6 text-center">
            {game.status === 'won' ? (
              <>
                <div className="space-y-3">
                  <p className="text-4xl">🎉</p>
                  <h2 className="text-3xl font-bold">I guessed your number!</h2>
                </div>

                <p className="text-lg text-slate-600 dark:text-slate-300">Your number was {game.guess}.</p>
                <p className="text-base text-slate-600 dark:text-slate-300">Attempts: {game.attempts}</p>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-4xl">🤔</p>
                  <h2 className="text-3xl font-bold">I couldn&apos;t guess your number.</h2>
                </div>

                <p className="text-lg text-slate-600 dark:text-slate-300">Maybe one of the answers was incorrect.</p>
              </>
            )}

            <button
              type="button"
              onClick={resetGame}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              {game.status === 'won' ? 'Play Again' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
