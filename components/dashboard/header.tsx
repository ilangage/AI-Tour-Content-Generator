export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">AI Tour Content Generator</h1>
          <p className="text-muted-foreground">
            Generate SEO-optimized structured tour JSON for Next.js tour pages
          </p>
        </div>
      </div>
    </header>
  )
}
