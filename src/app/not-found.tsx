import { Wine } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-s text-center">
      <Wine className="h-16 w-16 text-primary mb-m" />
      <h1 className="font-display text-heading-l text-primary mb-xs">
        Page Not Found
      </h1>
      <p className="text-text-secondary text-body-l mb-l">
        We couldn&apos;t find that page.
      </p>
      <Link
        className="bg-primary text-text-on-primary px-l py-xs rounded-full font-medium text-body-m hover:bg-primary-hover transition-colors"
        href="/"
      >
        Return Home
      </Link>
    </div>
  );
}
