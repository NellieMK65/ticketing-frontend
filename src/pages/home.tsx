import { Calendar, MapPin, Search, Ticket } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import type { Category, Event } from "../lib/types";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch("http://localhost:5000/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Discover events that inspire you
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 leading-relaxed">
              From concerts to conferences, find and book tickets to the best
              experiences in your city.
            </p>

            {/* Search Bar */}
            <div className="bg-background rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-3">
                <HugeiconsIcon
                  icon={Search}
                  className="h-5 w-5 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground py-2"
                />
              </div>
              <div className="flex items-center gap-2 px-3 border-t md:border-t-0 md:border-l border-border pt-2 md:pt-0">
                <HugeiconsIcon
                  icon={MapPin}
                  className="h-5 w-5 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground py-2"
                />
              </div>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Search Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 text-center">
                  <div className="font-semibold text-foreground">
                    {category.name}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {category.event_count} events
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Button variant="outline" asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {events.slice(0, 4).map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={event.poster || "/placeholder.svg"}
                      alt={event.name}
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                      {event.category.name}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-balance">
                      {event.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar} className="h-4 w-4" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={MapPin} className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Ticket} className="h-4 w-4" />
                        <span className="font-semibold text-foreground">
                          From KES{" "}
                          {
                            (event.tickets.sort((a, b) => a.price - b.price) ??
                              [])[0]?.price
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-balance">
            Never miss out on amazing events
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Get notified about the latest events and exclusive early bird
            offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto items-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
            />
            <Button size="lg">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
