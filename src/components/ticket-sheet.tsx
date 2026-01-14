import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Field, FieldLabel, FieldError } from "./ui/field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "./ui/sheet";
import { Input } from "./ui/input";
/**
 * ============================================================================
 * TICKET SHEET COMPONENT
 * ============================================================================
 *
 * A reusable sheet (slide-out panel) component for creating tickets.
 * This component is "controlled" - the parent decides when it's open/closed.
 *
 * Why a separate component?
 * - Separation of concerns: ticket logic is isolated from event logic
 * - Reusability: could be used elsewhere in the app
 * - Testability: easier to test in isolation
 */

/**
 * Zod Schema for Ticket Validation
 * --------------------------------
 * Zod is a TypeScript-first schema validation library.
 * It provides both runtime validation AND TypeScript types.
 *
 * Benefits over manual validation:
 * - Type safety: z.infer<typeof schema> gives us the TypeScript type
 * - Declarative: schema reads like documentation
 * - Composable: schemas can be combined and extended
 */
const ticketSchema = z.object({
  name: z
    .string({ error: "Ticket name is required" })
    .min(1, "Ticket name is required"),
  price: z
    .number({ error: "Price is required" })
    .min(1, "Price must be at least 1"),
  tickets_available: z
    .number({ error: "Available tickets is required" })
    .min(1, "Must have at least 1 ticket available"),
});

// Infer TypeScript type from Zod schema - no need to define it manually!
type TicketFormData = z.infer<typeof ticketSchema>;

/**
 * Props interface for TicketSheet
 * --------------------------------
 * Defining props as an interface improves:
 * - Code readability
 * - IDE autocomplete
 * - Documentation
 */
interface TicketSheetProps {
  eventId: number; // Which event to create tickets for
  eventName: string; // Display name in the sheet header
  open: boolean; // Controlled open state
  onOpenChange: (open: boolean) => void; // Callback when open state should change
  onTicketCreated: () => void; // Callback after successful ticket creation
}

export function TicketSheet({
  eventId,
  eventName,
  open,
  onOpenChange,
  onTicketCreated,
}: TicketSheetProps) {
  /**
   * React Hook Form Setup
   * ---------------------
   * useForm is a hook that manages form state, validation, and submission.
   *
   * Key options:
   * - resolver: Connects Zod schema for validation
   * - defaultValues: Initial form values (important for controlled inputs)
   *
   * Returns:
   * - register: Connects input to form state
   * - handleSubmit: Wraps submission with validation
   * - formState: Contains errors, isSubmitting, etc.
   * - reset: Resets form to default values
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      price: 0,
      tickets_available: 0,
    },
  });

  /**
   * Form Submission Handler
   * -----------------------
   * This function runs ONLY if validation passes (thanks to handleSubmit wrapper).
   *
   * Pattern: async/await with try/catch for API calls
   * - Makes code readable (no nested .then() chains)
   * - Proper error handling
   */
  const onSubmit = async (data: TicketFormData) => {
    try {
      const response = await fetch("http://localhost:5000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Spread form data and add eventId
        body: JSON.stringify({
          ...data,
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create ticket");
      }

      // Success! Reset form, close sheet, notify parent
      reset();
      onOpenChange(false);
      onTicketCreated();
    } catch (error) {
      console.error("Error creating ticket:", error);
      // In production, you'd show this error to the user
      alert(error instanceof Error ? error.message : "Failed to create ticket");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Ticket</SheetTitle>
          <SheetDescription>
            Create a new ticket type for "{eventName}"
          </SheetDescription>
        </SheetHeader>

        {/*
          Form Element
          ------------
          onSubmit={handleSubmit(onSubmit)} does two things:
          1. Prevents default form submission (page reload)
          2. Runs validation before calling onSubmit
        */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 px-4 py-4">
            {/*
              Field Component Pattern
              -----------------------
              Each field follows the same structure:
              1. Field wrapper (handles invalid state styling)
              2. FieldLabel (accessible label)
              3. Input (the actual input)
              4. FieldError (validation error message)

              data-invalid attribute triggers error styling via CSS
            */}

            {/* Ticket Name Field */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="ticket-name">Ticket Name</FieldLabel>
              <Input
                id="ticket-name"
                placeholder="e.g., VIP, Regular, Early Bird"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/*
              Price Field
              -----------
              Note: valueAsNumber transforms string input to number automatically.
              Without it, "100" would be stored as string, failing Zod's z.number() validation.
            */}
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="ticket-price">Price (KES)</FieldLabel>
              <Input
                id="ticket-price"
                type="number"
                min={0}
                placeholder="Enter price in KES"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.price]} />
            </Field>

            {/* Tickets Available Field */}
            <Field data-invalid={!!errors.tickets_available}>
              <FieldLabel htmlFor="tickets-available">
                Tickets Available
              </FieldLabel>
              <Input
                id="tickets-available"
                type="number"
                min={1}
                placeholder="Number of tickets to sell"
                aria-invalid={!!errors.tickets_available}
                {...register("tickets_available", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.tickets_available]} />
            </Field>
          </div>

          <SheetFooter>
            {/*
              Submit Button States
              --------------------
              - disabled during submission prevents double-clicks
              - Shows spinner and "Creating..." text for feedback
            */}
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
