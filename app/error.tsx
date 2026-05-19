'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Something went wrong</h2>
        <button onClick={reset} className="text-sm text-slate-600 underline hover:text-slate-900">
          Try again
        </button>
      </div>
    </div>
  )
}
