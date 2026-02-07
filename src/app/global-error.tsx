'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-[#FDF8F0] text-[#333333]">
        <h1 className="text-2xl font-bold text-[#722F37] mb-4">
          Something went wrong
        </h1>
        <p className="text-lg text-[#666666] mb-6">
          We spilled a little wine. Please try again.
        </p>
        <button
          className="bg-[#722F37] text-white px-8 py-3 rounded-full font-medium hover:bg-[#5e2530] transition-colors"
          onClick={() => reset()}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
