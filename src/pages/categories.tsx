/**
 * CategoriesPage Component
 *
 * This page displays all event categories and allows users to browse events by category.
 * When a user clicks on a category, they see all events belonging to that category.
 *
 * Key concepts demonstrated:
 * - Fetching and displaying data from an API
 * - Navigation between categories and their events
 * - Responsive card grid layouts
 * - Loading and empty states
 */

import {
  Calendar,
  MapPin,
  Ticket,
  FolderOpen,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import type { Category, Event } from "../lib/types";
import { Spinner } from "../components/ui/spinner";

export default function CategoriesPage() {
  /**
   * State Management
   * ----------------
   * We track categories, events for the selected category, loading states, and which category is selected.
   */

  // All categories from the API
  const [categories, setCategories] = useState<Category[]>([]);

  // Events filtered by the selected category
  const [categoryEvents, setCategoryEvents] = useState<Event[]>([]);

  // Currently selected category (null = show category grid, not events)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Loading state for initial categories fetch
  const [isLoading, setIsLoading] = useState(true);

  // Loading state for events fetch when a category is selected
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  /**
   * Fetch Categories on Mount
   * -------------------------
   * This effect runs once when the component mounts to load all categories.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Handle Category Selection
   * -------------------------
   * When a user clicks a category, fetch all events for that category.
   * We filter events client-side after fetching all events, or you could
   * add a backend endpoint like /events?category_id=1
   */
  const handleCategoryClick = async (category: Category) => {
    setSelectedCategory(category);
    setIsLoadingEvents(true);

    try {
      // Fetch all events and filter by category_id
      // Alternative: Create a backend endpoint /events?category_id={id}
      const response = await fetch("http://localhost:5000/events");
      const allEvents: Event[] = await response.json();

      // Filter events that belong to the selected category
      const filteredEvents = allEvents.filter(
        (event) => event.category_id === category.id
      );
      setCategoryEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  /**
   * Handle Back to Categories
   * -------------------------
   * Reset the view to show all categories instead of events.
   */
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryEvents([]);
  };

  return (
    <div className="flex-1">
      {/* Page Header */}
      <section className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/*
            Conditional Header Content
            ---------------------------
            Shows different title based on whether a category is selected
          */}
          {selectedCategory ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackToCategories}
                className="mb-4 cursor-pointer"
              >
                ← Back to Categories
              </Button>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {selectedCategory.name}
              </h1>
              <p className="text-lg text-primary-foreground/90">
                {selectedCategory.event_count} event
                {selectedCategory.event_count !== 1 ? "s" : ""} in this category
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Browse Categories
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Explore events by category to find exactly what you're looking
                for
              </p>
            </>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/*
            Conditional Content Rendering
            -----------------------------
            1. Loading state for categories
            2. Category grid (when no category selected)
            3. Events grid (when category is selected)
          */}
          {isLoading ? (
            // Loading Categories State
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner className="h-8 w-8 mb-4" />
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          ) : selectedCategory ? (
            // Events View - Show events for selected category
            <>
              {isLoadingEvents ? (
                // Loading Events State
                <div className="flex flex-col items-center justify-center py-20">
                  <Spinner className="h-8 w-8 mb-4" />
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : categoryEvents.length === 0 ? (
                // Empty Events State
                <div className="text-center py-20">
                  <HugeiconsIcon
                    icon={FolderOpen}
                    className="h-16 w-16 mx-auto mb-4 text-muted-foreground"
                  />
                  <h2 className="text-2xl font-bold mb-2">No events yet</h2>
                  <p className="text-muted-foreground mb-6">
                    There are no events in this category at the moment.
                  </p>
                  <Button variant="outline" onClick={handleBackToCategories}>
                    Browse Other Categories
                  </Button>
                </div>
              ) : (
                // Events Grid
                <>
                  <p className="text-muted-foreground mb-6">
                    Showing {categoryEvents.length} event
                    {categoryEvents.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryEvents.map((event) => (
                      <Link key={event.id} to={`/events/${event.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                          <div className="aspect-video relative overflow-hidden bg-muted">
                            <img
                              src={event.poster || "/placeholder.svg"}
                              alt={event.name}
                              className="object-cover w-full h-full"
                            />
                            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                              {event.status}
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-balance line-clamp-2">
                              {event.name}
                            </h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                  icon={Calendar}
                                  className="h-4 w-4"
                                />
                                <span>
                                  {new Date(
                                    event.start_date
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                  icon={MapPin}
                                  className="h-4 w-4"
                                />
                                <span className="line-clamp-1">
                                  {event.venue}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                  icon={Ticket}
                                  className="h-4 w-4"
                                />
                                <span className="font-semibold text-foreground">
                                  From KES{" "}
                                  {(event.tickets.sort(
                                    (a, b) => a.price - b.price
                                  ) ?? [])[0]?.price ?? "N/A"}
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
            </>
          ) : (
            // Categories Grid View
            <>
              {categories.length === 0 ? (
                // Empty Categories State
                <div className="text-center py-20">
                  <HugeiconsIcon
                    icon={FolderOpen}
                    className="h-16 w-16 mx-auto mb-4 text-muted-foreground"
                  />
                  <h2 className="text-2xl font-bold mb-2">No categories yet</h2>
                  <p className="text-muted-foreground">
                    Check back later for event categories.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-6">
                    {categories.length} categor
                    {categories.length !== 1 ? "ies" : "y"} available
                  </p>
                  {/*
                    Categories Grid
                    ---------------
                    Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large
                  */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                      <Card
                        key={category.id}
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                        onClick={() => handleCategoryClick(category)}
                      >
                        <CardContent className="p-6 text-center">
                          {/*
                            Category Icon
                            -------------
                            Using a folder icon as placeholder.
                            In a real app, each category might have its own icon.
                          */}
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <HugeiconsIcon
                              icon={FolderOpen}
                              className="h-8 w-8 text-primary"
                            />
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            {category.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {category.event_count} event
                            {category.event_count !== 1 ? "s" : ""}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
