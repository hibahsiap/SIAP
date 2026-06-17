// Shared option lists + label↔enum normalizers for ticket filtering.
//
// The admin API (/api/tickets) returns raw Prisma enums ("TO_DO", "LOW", "COMPLAINT"),
// while the OPD API (/api/opd/tickets) maps some fields to display labels ("To Do", "Low").
// Filter state always stores the canonical ENUM value; the normalizers below convert any
// incoming value (enum OR display label) to the enum so comparisons work in both views.

export type FilterOption = { value: string; label: string };

export const STATUS_OPTIONS: FilterOption[] = [
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DONE", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const PRIORITY_OPTIONS: FilterOption[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export const TYPE_OPTIONS: FilterOption[] = [
  { value: "COMPLAINT", label: "Pengaduan" },
  { value: "QUESTION", label: "Pertanyaan" },
  { value: "FEEDBACK", label: "Saran" },
];

const STATUS_LABEL_TO_ENUM: Record<string, string> = {
  "To Do": "TO_DO",
  "In Progress": "IN_PROGRESS",
  "On Hold": "ON_HOLD",
  Done: "DONE",
  // Canonical display label is "Cancelled" (double L); accept the single-L spelling
  // too as a defensive fallback in case any older value slips through.
  Cancelled: "CANCELLED",
  Canceled: "CANCELLED",
};

const PRIORITY_LABEL_TO_ENUM: Record<string, string> = {
  Low: "LOW",
  Medium: "MEDIUM",
  High: "HIGH",
  Critical: "CRITICAL",
};

/** Normalize a status value (enum or display label) to its canonical enum. */
export function toStatusEnum(value?: string | null): string {
  if (!value) return "";
  return STATUS_LABEL_TO_ENUM[value] ?? value;
}

/** Normalize a priority value (enum or display label) to its canonical enum. */
export function toPriorityEnum(value?: string | null): string {
  if (!value) return "";
  return PRIORITY_LABEL_TO_ENUM[value] ?? value;
}
