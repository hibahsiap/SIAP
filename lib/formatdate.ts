/**
 * Format ISO date string ke format "February 29, 2005"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "-"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}