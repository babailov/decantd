'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-[#FAF7F2] text-[#2D2926]">
        <h1 className="text-2xl font-bold text-[#7B2D3A] mb-4">
          Something went wrong
        </h1>
        <p className="text-lg text-[#5C5650] mb-6">
          We spilled a little wine. Please try again.
        </p>
        <button
          className="bg-[#7B2D3A] text-white px-8 py-3 rounded-full font-medium hover:bg-[#662536] transition-colors"
          onClick={() => reset()}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
