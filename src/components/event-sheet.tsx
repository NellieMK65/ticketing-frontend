import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Field, FieldError, FieldLabel } from "./ui/field";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "./ui/spinner";

type Category = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

type Event = {
  id: number;
  name: string;
  description: string;
  venue: string;
  poster: string;
  status: "cancelled" | "postponed" | "active" | "completed";
  category_id: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

const eventStatuses = [
  "active",
  "postponed",
  "cancelled",
  "completed",
] as const;

const schema = z
  .object({
    name: z
      .string({ error: "Event name is required" })
      .min(1, "Event name is required"),
    description: z
      .string({ error: "Description is required" })
      .min(10, "Description must be at least 10 characters"),
    venue: z.string({ error: "Venue is required" }).min(1, "Venue is required"),
    poster: z
      .string({ error: "Poster URL is required" })
      .url("Please enter a valid URL"),
    status: z.enum(eventStatuses, {
      error: "Status is required",
    }),
    category_id: z
      .number({ error: "Category is required" })
      .min(1, "Category is required"),
    start_date: z
      .string({ error: "Start date is required" })
      .min(1, "Start date is required"),
    end_date: z
      .string({ error: "End date is required" })
      .min(1, "End date is required"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

type EventFormData = z.infer<typeof schema>;

// Helper to format date for datetime-local input
const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

export const EventSheet = ({
  event,
  categories,
}: {
  event?: Event;
  categories: Category[];
}) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: event?.name ?? "",
      description: event?.description ?? "",
      venue: event?.venue ?? "",
      poster: event?.poster ?? "",
      status: event?.status ?? "active",
      category_id: event?.category_id ?? 0,
      start_date: formatDateForInput(event?.start_date) ?? "",
      end_date: formatDateForInput(event?.end_date) ?? "",
    },
  });

  const handleFormSubmit = (data: EventFormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>{event ? "Edit event" : "Add event"}</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:w-185">
        <SheetHeader>
          <SheetTitle>{event ? "Edit event" : "Add event"}</SheetTitle>
          <SheetDescription>
            {event
              ? "Update the event details below."
              : "Fill in the details to create a new event."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid flex-1 auto-rows-min gap-4 px-4">
            {/* Event Name */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Event Name</FieldLabel>
              <Input
                id="name"
                placeholder="Enter event name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/* Description */}
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Enter event description"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            {/* Venue */}
            <Field data-invalid={!!errors.venue}>
              <FieldLabel htmlFor="venue">Venue</FieldLabel>
              <Input
                id="venue"
                placeholder="Enter venue location"
                aria-invalid={!!errors.venue}
                {...register("venue")}
              />
              <FieldError errors={[errors.venue]} />
            </Field>

            {/* Poster URL */}
            <Field data-invalid={!!errors.poster}>
              <FieldLabel htmlFor="poster">Poster URL</FieldLabel>
              <Input
                id="poster"
                type="url"
                placeholder="https://example.com/poster.jpg"
                aria-invalid={!!errors.poster}
                {...register("poster")}
              />
              <FieldError errors={[errors.poster]} />
            </Field>

            {/* Status */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="status"
                      className="w-full"
                      aria-invalid={!!errors.status}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>

            {/* Category */}
            <Field data-invalid={!!errors.category_id}>
              <FieldLabel htmlFor="category_id">Category</FieldLabel>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger
                      id="category_id"
                      className="w-full"
                      aria-invalid={!!errors.category_id}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.category_id]} />
            </Field>

            {/* Start Date */}
            <Field data-invalid={!!errors.start_date}>
              <FieldLabel htmlFor="start_date">Start Date & Time</FieldLabel>
              <Input
                id="start_date"
                type="datetime-local"
                aria-invalid={!!errors.start_date}
                {...register("start_date")}
              />
              <FieldError errors={[errors.start_date]} />
            </Field>

            {/* End Date */}
            <Field data-invalid={!!errors.end_date}>
              <FieldLabel htmlFor="end_date">End Date & Time</FieldLabel>
              <Input
                id="end_date"
                type="datetime-local"
                aria-invalid={!!errors.end_date}
                {...register("end_date")}
              />
              <FieldError errors={[errors.end_date]} />
            </Field>
          </div>
          <SheetFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
