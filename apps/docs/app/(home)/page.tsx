import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">LaserEyes Documentation</h1>
      <p className="mb-6 text-fd-muted-foreground">
        The Bitcoin wallet connector for React applications.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="px-4 py-2 rounded-md bg-fd-primary text-fd-primary-foreground font-medium"
        >
          Get Started
        </Link>
        <Link
          href="/docs/api-reference"
          className="px-4 py-2 rounded-md border font-medium"
        >
          API Reference
        </Link>
      </div>
    </div>
  );
}
