import { Link } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ChevronLeft } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import type { Event } from "../lib/types";
import { Spinner } from "../components/ui/spinner";
import { Input } from "../components/ui/input";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../components/ui/field";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "KES",
  currencyDisplay: "code",
  compactDisplay: "short",
});

/**
 * Type definition for cart items displayed in checkout
 * Combines ticket info with quantity and event context
 */
type CartItem = {
  id: number; // Unique identifier for this cart item (ticketId)
  eventId: number; // ID of the event this ticket belongs to
  name: string; // Display name formatted as "eventName - ticketName"
  ticketName: string; // Original ticket type name (e.g., "VIP", "General Admission")
  eventName: string; // Name of the event
  price: number; // Price per ticket
  quantity: number; // Number of tickets selected
  ticketsAvailable: number; // Stock limit for this ticket type
};

/**
 * Type for the cart structure stored in localStorage
 * Nested structure: { [eventId]: { [ticketId]: quantity } }
 */
type SavedCart = Record<string, Record<string, number>>;

const schema = z.object({
  phone: z
    .string({ error: "Phone number is required" })
    .regex(/^\+[1-9]\d{1,14}$/, {
      error:
        "Phone number must be in international format (e.g. +254712345678)",
    }),
});

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Loading state while fetching events
  const [error, setError] = useState<string | null>(null); // Error state for failed fetches

  useEffect(() => {
    /**
     * Fetches event data from the API and reconstructs cart items
     * Uses batch fetching with /events?ids=1,2,3 to get all events in one request
     */
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cart structure: { [eventId]: { [ticketId]: quantity } }
        const savedCart: SavedCart = JSON.parse(
          localStorage.getItem("ticketCart") || "{}"
        );

        // Get all unique event IDs from the cart
        const eventIds = Object.keys(savedCart);

        // If cart is empty, no need to fetch
        if (eventIds.length === 0) {
          setCartItems([]);
          setTotal(0);
          setIsLoading(false);
          return;
        }

        // Fetch all events in a single request using query parameter
        // API endpoint: /events?ids=1,2,3
        const response = await fetch(
          `http://localhost:5000/events?ids=${eventIds.join(",")}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const eventsData: Event[] = await response.json();

        // Create a map of eventId -> event for quick lookup
        const eventsMap: Record<string, Event> = {};
        eventsData.forEach((event) => {
          eventsMap[event.id.toString()] = event;
        });

        // Reconstruct cart items with full details from fetched event data
        const items: CartItem[] = [];
        let cartTotal = 0;

        // Iterate through each event in the cart
        Object.entries(savedCart).forEach(([eventId, ticketQuantities]) => {
          // Get the event data for this eventId
          const eventData = eventsMap[eventId];
          if (!eventData) return; // Skip if event not found

          // Iterate through each ticket for this event
          Object.entries(ticketQuantities).forEach(([ticketId, quantity]) => {
            const tid = Number.parseInt(ticketId);
            // Find the ticket in the event's ticket list
            const ticket = eventData.tickets.find((t) => t.id === tid);

            if (ticket) {
              // Create cart item with combined eventName - ticketName format
              items.push({
                id: ticket.id,
                eventId: eventData.id,
                name: `${eventData.name} - ${ticket.name}`,
                ticketName: ticket.name,
                eventName: eventData.name,
                price: ticket.price,
                quantity: quantity,
                ticketsAvailable: ticket.tickets_available,
              });
              cartTotal += ticket.price * quantity;
            }
          });
        });

        setCartItems(items);
        setTotal(cartTotal);
      } catch (err) {
        console.error("Error fetching cart data:", err);
        setError("Failed to load cart items. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    alert(`Order placed! Phone: ${values.phone}`);
    localStorage.removeItem("ticketCart");
  });

  // Show loading spinner while fetching event data
  if (isLoading) {
    return (
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <HugeiconsIcon icon={ChevronLeft} className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-12 flex flex-col items-center justify-center">
            <Spinner className="h-8 w-8 mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if fetching failed
  if (error) {
    return (
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <HugeiconsIcon icon={ChevronLeft} className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-12 text-center">
            <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <HugeiconsIcon icon={ChevronLeft} className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Select some tickets to get started!
            </p>
            <Button asChild>
              <Link to="/">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/">
          <HugeiconsIcon icon={ChevronLeft} className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      <div className="grid gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between py-2 border-b border-border"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatter.format(item.price * item.quantity)}
                </p>
              </div>
            ))}
            <div className="flex justify-between pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-accent">{formatter.format(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input
                      required
                      id="phone"
                      type="tel"
                      placeholder="+254712345678"
                      {...field}
                    />
                    <FieldDescription>
                      We'll use this number to send you an MPESA payment
                      request.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={cartItems.length === 0 || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                Complete Purchase
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
