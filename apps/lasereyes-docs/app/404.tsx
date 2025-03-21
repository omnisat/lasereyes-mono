export default function Static404Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        Return Home
      </a>
    </div>
  )
}

