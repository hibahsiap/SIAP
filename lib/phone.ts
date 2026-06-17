// Indonesian phone number helpers.
//
// Canonical storage format is E.164 without separators, e.g. "+6281234567890".
// Input is accepted flexibly: "0812-3456-7890", "62812 3456 7890", "+62812...".

/**
 * Normalize an Indonesian phone number to canonical E.164 ("+62...").
 * Returns null when the input is not a valid Indonesian mobile number.
 */
export function normalizePhone(input: string): string | null {
  if (!input) return null;

  // Keep digits only ('+', spaces, dashes, dots, parens are dropped).
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("62")) {
    // already country-coded
  } else if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1); // 0812... -> 62812...
  } else if (digits.startsWith("8")) {
    digits = "62" + digits; // 812... -> 62812...
  } else {
    return null;
  }

  // +62 followed by a mobile number starting with 8 (total national part 9-14 digits).
  if (!/^628\d{6,11}$/.test(digits)) return null;

  return "+" + digits;
}

/** True when the input can be normalized to a valid Indonesian mobile number. */
export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}
