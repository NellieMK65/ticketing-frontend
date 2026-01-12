import { Link } from "react-router";
import { Button } from "../ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">

            <span>EventHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-sm font-medium hover:text-accent transition-colors">
              Browse Events
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-accent transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm">Create Event</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
