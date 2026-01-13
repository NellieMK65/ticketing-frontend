import { EventSheet } from "../../components/event-sheet";

export default function AdminEventsPage() {
  return (
    <div>
      <div className="flex w-full justify-end">
        <EventSheet categories={[]} />
      </div>
    </div>
  );
}
