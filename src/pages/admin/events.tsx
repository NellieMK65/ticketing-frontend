/**
 * AdminEventsPage Component
 *
 * This is the admin dashboard page for managing events and their tickets.
 * It demonstrates several advanced React patterns commonly used in admin interfaces:
 *
 * Key Features:
 * - CRUD operations for events (Create, Read, Update, Delete)
 * - Nested CRUD for tickets within events
 * - Data table with sorting, filtering, and pagination (TanStack Table)
 * - Sheet/Modal components for forms
 * - Form validation with react-hook-form and Zod
 * - Loading and empty states
 * - Optimistic UI updates after mutations
 *
 * Architecture:
 * - Parent component manages the list of events
 * - EventSheet handles event creation/editing
 * - TicketSheet handles ticket creation for specific events
 * - Each component has its own form state and validation
 *
 * TanStack Table (React Table):
 * - Headless UI library for building powerful tables
 * - Provides sorting, filtering, pagination out of the box
 * - Full control over rendering and styling
 */

import { useEffect, useState } from "react";
import { EventSheet } from "../../components/event-sheet";
import type { Category, Event, Ticket } from "../../lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Ticket01Icon,
  PlusSignIcon,
  Calendar,
  ArrowUp01Icon,
  ArrowDown01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";

/**
 * TanStack Table Imports
 * ----------------------
 * These are the core building blocks for our data table:
 *
 * - ColumnDef: Type for defining table columns
 * - flexRender: Renders cells/headers with proper types
 * - getCoreRowModel: Basic row model (required)
 * - getPaginationRowModel: Enables client-side pagination
 * - getSortedRowModel: Enables client-side sorting
 * - getFilteredRowModel: Enables client-side filtering
 * - useReactTable: The main hook that creates the table instance
 * - SortingState: Type for sorting state
 * - ColumnFiltersState: Type for filter state
 */
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "../../components/ui/input";
import { TicketSheet } from "../../components/ticket-sheet";

/**
 * ============================================================================
 * EVENT TICKETS LIST COMPONENT
 * ============================================================================
 *
 * Displays existing tickets for an event in a mini-table format.
 * This component is intentionally simple - just displays data, no mutations.
 */
interface EventTicketsListProps {
  tickets: Ticket[];
}

function EventTicketsList({ tickets }: EventTicketsListProps) {
  if (tickets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No tickets created yet
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1"
        >
          <span className="font-medium">{ticket.name}</span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {ticket.tickets_available} available
            </span>
            <Badge variant="outline">KES {ticket.price.toLocaleString()}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ============================================================================
 * MAIN ADMIN EVENTS PAGE COMPONENT
 * ============================================================================
 *
 * The parent component that orchestrates:
 * - Fetching and displaying events
 * - Managing which modals/sheets are open
 * - Refreshing data after mutations
 * - TanStack Table for sorting, filtering, and pagination
 */
export default function AdminEventsPage() {
  /**
   * State Management
   * ----------------
   * We organize state by concern:
   * - Data state: events, categories
   * - UI state: loading, which ticket sheet is open
   * - Table state: sorting, filtering (managed by TanStack Table)
   */

  // Data fetched from API
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Loading state for initial fetch
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Ticket Sheet State
   * ------------------
   * We need to track WHICH event's ticket sheet is open.
   * null = no sheet open, number = event ID whose sheet is open
   */
  const [ticketSheetEventId, setTicketSheetEventId] = useState<number | null>(
    null
  );

  /**
   * TanStack Table State
   * --------------------
   * These state variables are controlled by TanStack Table internally,
   * but we need to declare them for the table to persist state across renders.
   *
   * - sorting: Array of { id: columnId, desc: boolean } objects
   * - columnFilters: Array of { id: columnId, value: filterValue } objects
   */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  /**
   * Data Fetching Function
   * ----------------------
   * Extracted as a named function so we can:
   * 1. Call it on mount (in useEffect)
   * 2. Call it after mutations (to refresh data)
   */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:5000/events"),
        fetch("http://localhost:5000/categories"),
      ]);

      const eventsData = await eventsRes.json();
      const categoriesData = await categoriesRes.json();

      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Helper function to get the currently selected event
   */
  const getSelectedEvent = () => {
    if (ticketSheetEventId === null) return undefined;
    return events.find((e) => e.id === ticketSheetEventId);
  };

  /**
   * Status Badge Color Mapping
   * --------------------------
   * Maps event status to appropriate badge variant.
   */
  const getStatusBadgeVariant = (
    status: Event["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<
      Event["status"],
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      completed: "secondary",
      cancelled: "destructive",
      postponed: "outline",
    };
    return variants[status];
  };

  /**
   * Column Definitions
   * ------------------
   * This is where we define what columns our table has and how they behave.
   *
   * Each column can have:
   * - accessorKey: The key in our data object (for simple data access)
   * - accessorFn: Custom function to extract data (for complex/nested data)
   * - header: String or function for the header cell
   * - cell: Function to render the cell content
   * - enableSorting: Whether this column can be sorted (default: true)
   * - filterFn: Custom filter function
   *
   * The generic type <Event> tells TypeScript what data type the table uses.
   */
  const columns: ColumnDef<Event>[] = [
    {
      /**
       * Event Name Column
       * -----------------
       * Shows event name and venue in a stacked layout.
       * Uses accessorKey for the primary sort/filter value.
       */
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="gap-1 -ml-4"
          >
            Event
            {column.getIsSorted() === "asc" ? (
              <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.venue}</p>
        </div>
      ),
    },
    {
      /**
       * Category Column
       * ---------------
       * Shows the event's category as a badge.
       * Uses accessorFn because category is a nested object.
       */
      id: "category",
      accessorFn: (row) => row.category?.name ?? "Uncategorized",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category?.name ?? "N/A"}</Badge>
      ),
      /**
       * Custom filter function for category
       * Allows filtering by category name
       */
      filterFn: (row, id, value) => {
        return (
          row
            .getValue(id)
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase()) ?? false
        );
      },
    },
    {
      /**
       * Date Column
       * -----------
       * Shows formatted date and time.
       * Uses accessorKey for sorting by actual date value.
       */
      accessorKey: "start_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="gap-1 -ml-4"
          >
            Date
            {column.getIsSorted() === "asc" ? (
              <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-sm">
          <p>
            {new Date(row.original.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-muted-foreground">
            {new Date(row.original.start_date).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      /**
       * Status Column
       * -------------
       * Shows status as a colored badge.
       */
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </Badge>
      ),
      /**
       * Custom filter for status - exact match
       */
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === value;
      },
    },
    {
      /**
       * Tickets Column
       * --------------
       * Shows a list of tickets for the event.
       * Sorting is disabled as it doesn't make sense for this column.
       */
      id: "tickets",
      header: "Tickets",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="max-w-xs">
          <EventTicketsList tickets={row.original.tickets || []} />
        </div>
      ),
    },
    {
      /**
       * Actions Column
       * --------------
       * Contains action buttons for each row.
       * No sorting/filtering on actions.
       */
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setTicketSheetEventId(row.original.id)}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            <HugeiconsIcon icon={Ticket01Icon} className="h-4 w-4" />
          </Button>
          <EventSheet
            event={row.original}
            categories={categories}
            onEventCreated={fetchData}
          />
        </div>
      ),
    },
  ];

  /**
   * Create Table Instance
   * ---------------------
   * useReactTable creates the table instance with all our configuration.
   *
   * Key configuration:
   * - data: The array of events to display
   * - columns: Our column definitions
   * - getCoreRowModel: Required - basic row model
   * - getPaginationRowModel: Enables pagination
   * - getSortedRowModel: Enables sorting
   * - getFilteredRowModel: Enables filtering
   * - onSortingChange: Updates sorting state
   * - onColumnFiltersChange: Updates filter state
   * - state: Current table state (sorting, filters)
   */
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage events and their tickets
          </p>
        </div>
        <EventSheet categories={categories} onEventCreated={fetchData} />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner className="h-8 w-8 mb-4" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-lg">
          <HugeiconsIcon
            icon={Calendar}
            className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
          />
          <h2 className="text-xl font-semibold mb-2">No events yet</h2>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first event
          </p>
          <EventSheet categories={categories} onEventCreated={fetchData} />
        </div>
      ) : (
        <div className="space-y-4">
          {/**
           * Table Toolbar
           * -------------
           * Contains search/filter inputs above the table.
           * The filter value is synced with TanStack Table's filter state.
           */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <HugeiconsIcon
                icon={FilterIcon}
                className="h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Filter by event name..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} of{" "}
              {table.getCoreRowModel().rows.length} event(s)
            </div>
          </div>

          {/**
           * Data Table
           * ----------
           * The actual table rendered using TanStack Table's APIs.
           * We use our existing shadcn/ui Table components for styling.
           */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                {/**
                 * Header Groups
                 * -------------
                 * TanStack Table supports grouped headers for complex tables.
                 * For simple tables like ours, there's usually just one group.
                 */}
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {/**
                         * flexRender
                         * ----------
                         * This function properly renders the header content.
                         * It handles both string headers and function headers.
                         */}
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      /**
                       * data-state attribute
                       * --------------------
                       * Used for styling selected rows (if selection is enabled).
                       */
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {/**
                           * Cell Rendering
                           * --------------
                           * Similar to headers, flexRender handles cell content.
                           */}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/**
           * Pagination Controls
           * -------------------
           * TanStack Table provides methods to control pagination:
           * - previousPage() / nextPage(): Navigate pages
           * - getCanPreviousPage() / getCanNextPage(): Check if navigation is possible
           * - getState().pagination: Get current page info
           * - getPageCount(): Total number of pages
           */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Sheet (Rendered at Root Level) */}
      {getSelectedEvent() && (
        <TicketSheet
          eventId={getSelectedEvent()!.id}
          eventName={getSelectedEvent()!.name}
          open={ticketSheetEventId !== null}
          onOpenChange={(open) => {
            if (!open) setTicketSheetEventId(null);
          }}
          onTicketCreated={fetchData}
        />
      )}
    </div>
  );
}
