/**
 * TicketCounter Component
 * A reusable counter component for selecting ticket quantities on event pages.
 * Features: increment/decrement buttons, localStorage persistence, and price display.
 */

import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "./ui/button";
import { Minus, Plus } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";

/**
 * Props interface for TicketCounter component
 * TypeScript interfaces define the "shape" of data - what props this component expects
 */
interface TicketCounterProps {
  eventId: number; // ID of the event this ticket belongs to (for cart tracking)
  ticketId: number; // Unique identifier for this ticket type
  ticketName: string; // Display name (e.g., "VIP", "Regular")
  price: number; // Price per ticket in KES
  availableTickets: number; // Max tickets user can select (stock limit)
  // This can be used to disable the + button when max is reached by querying the backend for available tickets
  onCountChange: (count: number) => void; // Callback function when count changes (for parent component)
}

/**
 * Intl.NumberFormat - Built-in JS API for formatting numbers as currency
 * We create this OUTSIDE the component so it's not recreated on every render (performance optimization)
 *
 * Options explained:
 * - "en-US": US English formatting (uses commas for thousands: 1,000)
 * - style: "currency": Formats as money (adds currency symbol/code)
 * - currency: "KES": Kenyan Shilling
 * - currencyDisplay: "code": Shows "KES" text instead of symbol
 * - compactDisplay: "short": Shortens large numbers (1K instead of 1,000)
 *
 * Example: formatter.format(1500) → "KES 1,500.00"
 */
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "KES",
  currencyDisplay: "code",
  compactDisplay: "short",
});

export function TicketCounter({
  eventId,
  ticketId,
  ticketName,
  price,
  availableTickets,
  onCountChange,
}: TicketCounterProps) {
  // State to track how many tickets the user has selected
  // useState(0) means we start with 0 tickets selected
  const [count, setCount] = useState(0);

  /**
   * useEffect - Runs side effects in functional components
   * This effect loads the saved cart from localStorage when component mounts
   *
   * Why localStorage? So the cart persists even if user refreshes the page
   *
   * Cart structure: { [eventId]: { [ticketId]: quantity, ... }, ... }
   * This allows us to track which tickets belong to which events
   *
   * The [eventId, ticketId] dependency array means this effect runs:
   * 1. On initial component mount
   * 2. Whenever eventId or ticketId changes (e.g., switching events or ticket types)
   */
  useEffect(() => {
    // Get existing cart from localStorage, or empty object {} if none exists
    // JSON.parse converts the stored string back into a JavaScript object
    const cart = JSON.parse(localStorage.getItem("ticketCart") || "{}");
    // Get the tickets for this specific event, then get quantity for this ticket
    const eventTickets = cart[eventId] || {};
    setCount(eventTickets[ticketId] || 0);
  }, [eventId, ticketId]);

  /**
   * Handler for the "+" button - increases ticket count by 1
   * Includes validation: can't exceed available tickets
   */
  const handleIncrease = () => {
    if (count < availableTickets) {
      const newCount = count + 1;
      setCount(newCount); // Update local state (triggers re-render)
      updateCart(ticketId, newCount); // Persist to localStorage
      onCountChange(newCount); // Notify parent component of change
    }
  };

  /**
   * Handler for the "-" button - decreases ticket count by 1
   * Includes validation: can't go below 0
   */
  const handleDecrease = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      updateCart(ticketId, newCount);
      onCountChange(newCount);
    }
  };

  /**
   * Helper function to update the cart in localStorage
   * localStorage only stores strings, so we use JSON.stringify/parse
   *
   * Cart structure: { [eventId]: { [ticketId]: quantity, ... }, ... }
   * This nested structure keeps track of which tickets belong to which events
   *
   * @param ticketIdToUpdate - The ticket ID to update
   * @param quantity - The new quantity (0 means remove from cart)
   */
  const updateCart = (ticketIdToUpdate: number, quantity: number) => {
    // Get current cart state
    const cart = JSON.parse(localStorage.getItem("ticketCart") || "{}");

    // Ensure the event entry exists in the cart
    if (!cart[eventId]) {
      cart[eventId] = {};
    }

    if (quantity === 0) {
      // Remove ticket from this event's cart if quantity is 0 (keeps cart clean)
      delete cart[eventId][ticketIdToUpdate];

      // If no more tickets for this event, remove the event entry entirely
      if (Object.keys(cart[eventId]).length === 0) {
        delete cart[eventId];
      }
    } else {
      // Update quantity for this ticket ID under the specific event
      cart[eventId][ticketIdToUpdate] = quantity;
    }

    // Save updated cart back to localStorage
    // JSON.stringify converts the object to a string for storage
    localStorage.setItem("ticketCart", JSON.stringify(cart));
  };

  return (
    // Flex container for horizontal layout with gap between items
    <div className="flex items-center gap-2 mt-3">
      {/* Decrease button - disabled when count is 0 (can't go negative) */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrease}
        disabled={count === 0}
        className="h-8 w-8 p-0 bg-transparent cursor-pointer"
      >
        <HugeiconsIcon icon={Minus} className="h-4 w-4" />
      </Button>

      {/* Display current count - centered with fixed width for consistent layout */}
      <span className="w-8 text-center font-semibold">{count}</span>

      {/* Increase button - disabled when max tickets reached */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrease}
        disabled={count === availableTickets}
        className="h-8 w-8 p-0 bg-transparent cursor-pointer"
      >
        <HugeiconsIcon icon={Plus} className="h-4 w-4" />
      </Button>

      {/*
        Conditional rendering: Only show subtotal when count > 0
        The && operator is a common React pattern - if left side is false,
        nothing renders. If true, renders the right side.
      */}
      {count > 0 && (
        <span className="ml-auto text-sm font-semibold text-accent">
          {/* Calculate and format the subtotal (count × price per ticket) */}
          {formatter.format(count * price)}
        </span>
      )}
    </div>
  );
}
