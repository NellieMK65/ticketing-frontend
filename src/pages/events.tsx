/**
 * EventsPage Component
 *
 * This page displays all events with search and category filtering functionality.
 * It demonstrates several important React patterns:
 * - Data fetching with useEffect
 * - Multiple useState hooks for different pieces of state
 * - Client-side filtering of data
 * - Conditional rendering for loading/empty/data states
 * - Responsive grid layouts with Tailwind CSS
 */

import { Calendar, MapPin, Search, Ticket } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import type { Category, Event } from "../lib/types";
import { Spinner } from "../components/ui/spinner";

export default function EventsPage() {
  /**
   * State Management
   * ----------------
   * We use multiple useState hooks to manage different pieces of state independently.
   * This is a common pattern - each piece of state that changes independently gets its own useState.
   */

  // Stores the list of categories fetched from the API
  const [categories, setCategories] = useState<Category[]>([]);

  // Stores the list of all events fetched from the API
  const [events, setEvents] = useState<Event[]>([]);

  // Tracks whether data is currently being fetched (for showing loading spinner)
  const [isLoading, setIsLoading] = useState(true);

  // Stores the user's search input for filtering events
  const [searchQuery, setSearchQuery] = useState("");

  // Stores the currently selected category ID (null means "All" categories)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  /**
   * Data Fetching with useEffect
   * ----------------------------
   * useEffect runs side effects (like API calls) after the component renders.
   *
   * The empty dependency array [] means this effect runs ONCE when the component mounts.
   * If we had [someVariable] as the dependency, it would re-run whenever someVariable changes.
   *
   * We define an async function inside useEffect because useEffect itself cannot be async.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        /**
         * Promise.all - Parallel API Calls
         * ---------------------------------
         * Promise.all takes an array of promises and waits for ALL of them to complete.
         * This is more efficient than awaiting each fetch sequentially because both
         * requests happen at the same time.
         *
         * Example of sequential (slower):
         *   const categoriesRes = await fetch('/categories');
         *   const eventsRes = await fetch('/events'); // waits for first to finish
         *
         * With Promise.all (faster):
         *   Both requests start immediately and we wait for both to finish together.
         */
        const [categoriesRes, eventsRes] = await Promise.all([
          fetch("http://localhost:5000/categories"),
          fetch("http://localhost:5000/events"),
        ]);

        // Parse JSON responses - .json() is also async, so we await it
        const categoriesData = await categoriesRes.json();
        const eventsData = await eventsRes.json();

        // Update state with fetched data - this triggers a re-render
        setCategories(categoriesData);
        setEvents(eventsData);
      } catch (error) {
        // Always handle errors in async code - network requests can fail
        console.error("Error fetching data:", error);
      } finally {
        // finally block runs whether try succeeds or catch runs
        // Perfect for cleanup like hiding loading spinners
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty array = run once on mount

  /**
   * Client-Side Filtering
   * ---------------------
   * Instead of making API calls every time the user types or clicks a category,
   * we filter the already-fetched data on the client side.
   *
   * Pros: Instant feedback, no network latency, reduced server load
   * Cons: Only works well with smaller datasets that fit in memory
   *
   * For large datasets (thousands of items), you'd want server-side filtering
   * with query parameters like: /events?search=concert&category=1
   */
  const filteredEvents = events.filter((event) => {
    /**
     * Search Matching
     * ---------------
     * We check if the search query appears in the event's name, venue, or description.
     * toLowerCase() ensures case-insensitive matching ("Concert" matches "concert").
     *
     * The || (OR) operator short-circuits: if searchQuery is empty, we skip the checks.
     */
    const matchesSearch =
      searchQuery === "" ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    /**
     * Category Matching
     * -----------------
     * null represents "All" categories - if null, every event matches.
     * Otherwise, we check if the event's category_id equals the selected one.
     */
    const matchesCategory =
      selectedCategory === null || event.category_id === selectedCategory;

    // Event must match BOTH search AND category filters
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1">
      {/*
        Page Header Section
        -------------------
        Contains the page title and search bar.
        Uses the primary color scheme for visual hierarchy.
      */}
      <section className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Events</h1>
          <p className="text-lg text-primary-foreground/90 mb-6">
            Discover and book tickets to amazing events happening near you
          </p>

          {/*
            Controlled Input Component
            --------------------------
            The input's value is controlled by React state (searchQuery).
            onChange updates the state, which triggers a re-render with the new value.
            This is called a "controlled component" - React is the source of truth.
          */}
          <div className="bg-background rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-lg max-w-2xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <HugeiconsIcon
                icon={Search}
                className="h-5 w-5 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground py-2"
              />
            </div>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer w-full md:w-auto"
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      {/*
        Categories Filter Section
        -------------------------
        Displays clickable buttons for each category.
        The selected category gets a different style (variant="default" vs "outline").
      */}
      <section className="py-6 px-4 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2">
            {/* "All" button - selected when selectedCategory is null */}
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="cursor-pointer"
            >
              All
            </Button>
            {/*
              Mapping Over Arrays
              -------------------
              .map() transforms each category into a Button component.
              The key prop helps React identify which items changed for efficient re-renders.
              Always use a unique identifier (like id) as the key, not array index.
            */}
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="cursor-pointer"
              >
                {category.name} ({category.event_count})
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/*
        Events Grid Section
        -------------------
        Uses conditional rendering to show different UI based on state:
        1. Loading state: Show spinner while fetching
        2. Empty state: Show message when no events match filters
        3. Data state: Show the grid of event cards
      */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/*
            Conditional Rendering with Ternary Operators
            --------------------------------------------
            condition ? <ComponentA /> : <ComponentB />

            We chain ternaries here for multiple conditions:
            isLoading ? <Loading /> : (noEvents ? <Empty /> : <Grid />)
          */}
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner className="h-8 w-8 mb-4" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            // Empty State - No events match the current filters
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-2">No events found</h2>
              <p className="text-muted-foreground mb-6">
                {/* Show different message based on whether filters are active */}
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filter criteria"
                  : "Check back later for upcoming events"}
              </p>
              {/*
                Conditional Rendering with && (AND)
                -----------------------------------
                condition && <Component />
                If condition is true, renders Component. If false, renders nothing.
                Useful for optionally showing elements.
              */}
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset both filters at once
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            // Data State - Show the events grid
            <>
              {/*
                Dynamic Text with Pluralization
                --------------------------------
                Shows "1 event" or "5 events" based on count.
                The ternary adds 's' only when count !== 1
              */}
              <p className="text-muted-foreground mb-6">
                Showing {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""}
              </p>
              {/*
                Responsive Grid with Tailwind CSS
                ----------------------------------
                - Default (mobile): 1 column
                - md (768px+): 2 columns
                - lg (1024px+): 3 columns
                gap-6 adds spacing between grid items
              */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  // Link wraps the card to make the entire card clickable
                  <Link key={event.id} to={`/events/${event.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      {/*
                        aspect-video maintains 16:9 ratio regardless of image size
                        This prevents layout shift when images load
                      */}
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img
                          src={event.poster || "/placeholder.svg"}
                          alt={event.name}
                          className="object-cover w-full h-full"
                        />
                        {/* Absolute positioning places badge over the image */}
                        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                          {event.category.name}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        {/*
                          line-clamp-2 truncates text to 2 lines with ellipsis
                          Useful for keeping cards uniform height
                        */}
                        <h3 className="text-xl font-bold mb-2 text-balance line-clamp-2">
                          {event.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          {/* Event Date */}
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={Calendar}
                              className="h-4 w-4"
                            />
                            <span>
                              {/*
                                Date Formatting with toLocaleDateString
                                ----------------------------------------
                                Converts date string to readable format.
                                Options customize the output format.
                              */}
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
                          {/* Event Venue */}
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={MapPin} className="h-4 w-4" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                          {/*
                            Ticket Price - Shows the cheapest ticket
                            ----------------------------------------
                            .sort() arranges tickets by price (ascending)
                            [0] gets the first (cheapest) ticket
                            ?. (optional chaining) prevents errors if no tickets exist
                          */}
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={Ticket} className="h-4 w-4" />
                            <span className="font-semibold text-foreground">
                              From KES{" "}
                              {
                                (event.tickets.sort(
                                  (a, b) => a.price - b.price
                                ) ?? [])[0]?.price
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
