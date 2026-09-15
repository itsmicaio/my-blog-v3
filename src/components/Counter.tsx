import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="border-edge my-6 flex items-center gap-3 rounded-lg border p-4">
      <button
        type="button"
        onClick={() => setCount((c) => c - 1)}
        className="border-edge hover:border-accent cursor-pointer rounded-md border px-3 py-1"
        aria-label="Diminuir"
      >
        −
      </button>
      <span className="min-w-8 text-center font-mono tabular-nums">{count}</span>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="border-edge hover:border-accent cursor-pointer rounded-md border px-3 py-1"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}
