/**
 * Digit handling for the OTP boxes, from the web's components/shared/otp-input.tsx (setDigit + onPaste).
 * On a phone, a paste or the SMS code autofill arrives as several characters in one box: that is the web's paste case.
 */

/** New box values and the box to focus after typing `raw` into box `index`, or null to keep focus where it is. */
export function enterOtpText(value: string[], index: number, raw: string, length: number): { value: string[]; focus: number | null } {
  const digits = raw.replace(/\D/g, "");
  // The box held a digit and the new text is that digit plus one more: keep the last one (web: slice(-1)).
  if (digits.length <= 1 || (digits.length === 2 && value[index] && digits.includes(value[index]))) {
    const digit = digits.slice(-1);
    const next = Array.from({ length }, (_, i) => value[i] ?? "");
    next[index] = digit;
    return { value: next, focus: digit && index < length - 1 ? index + 1 : null };
  }
  // Pasted or autofilled code: fill from the first box, as the web's onPaste.
  const pasted = digits.slice(0, length);
  return { value: Array.from({ length }, (_, i) => pasted[i] ?? ""), focus: Math.min(pasted.length, length - 1) };
}

/** Backspace in an empty box moves to the previous one (web onKeyDown). */
export function otpBackspaceFocus(value: string[], index: number): number | null {
  return !value[index] && index > 0 ? index - 1 : null;
}
