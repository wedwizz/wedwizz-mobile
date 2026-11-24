import { AppText } from "./text";

/** Label row for form fields (web FormField): the label, a pink * when required, a muted note such as "(optional)". */
export function FieldLabel({ label, note, required }: { label: string; note?: string; required?: boolean }) {
  return (
    <AppText variant="label">
      {label}
      {required && <AppText variant="label" color="brand">{" *"}</AppText>}
      {note && <AppText variant="meta" color="muted">{` (${note})`}</AppText>}
    </AppText>
  );
}
