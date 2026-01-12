import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { featuredEvents } from "./home";
import { Button } from "../components/ui/button";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Share2,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function EventDetailsPage() {
  const [event, setEvent] = useState<any>(null);

  const params = useParams();

  console.log(params.id);
  console.log(event);

  useEffect(() => {
    // Fetch event details based on params.id
    // Example:
    // fetch(`/api/events/${params.id}`)
    //   .then(response => response.json())
    //   .then(data => setEvent(data));
    if (params.id) {
      setEvent(featuredEvents.find((e) => e.id === Number(params.id))!);
    }
  }, [params.id]);

  return (
    <div className="flex-1">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] bg-muted">
        <img
          src={event?.poster || "/placeholder.svg"}
          alt={event?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/">
              <HugeiconsIcon icon={ChevronLeft} className="h-4 w-4 mr-1" />
              Back to Events
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          <Button variant="secondary" size="icon">
            <HugeiconsIcon icon={Share2} className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon">
            <HugeiconsIcon icon={Heart} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div>
              <Badge className="mb-3">{event?.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                {event?.name}
              </h1>

              <div className="flex flex-col gap-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={Calendar}
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <div className="font-medium text-foreground">
                      {formatDate(event?.start_date)}
                      {event?.start_date !== event?.end_date && (
                        <> - {formatDate(event?.end_date)}</>
                      )}
                    </div>
                    <div className="text-sm">
                      {formatTime(event?.start_date)} -{" "}
                      {formatTime(event?.end_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HugeiconsIcon
                    icon={MapPin}
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <div className="font-medium text-foreground">
                      {event?.venue}
                    </div>
                    <Button variant="link" className="h-auto p-0 text-sm">
                      View on map
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event?.description}
              </p>
            </div>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className="bg-accent/10 border-accent"
                  >
                    {event?.status?.charAt(0)?.toUpperCase() +
                      event?.status?.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{event?.category}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Organizer</span>
                  <span className="font-medium">EventHub Team</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Select Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(event?.tickets ?? []).map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="p-4 border border-border rounded-lg hover:border-accent transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{ticket.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.tickets_available} tickets available
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          KES {ticket.price}
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-3" size="sm">
                      Select
                    </Button>
                  </div>
                ))}

                <div className="pt-4 border-t border-border">
                  <Button className="w-full" size="lg">
                    Continue to Checkout
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <HugeiconsIcon icon={Clock} className="h-4 w-4 inline mr-1" />
                  Tickets selling fast
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
