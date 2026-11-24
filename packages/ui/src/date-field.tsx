import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { formatDateKey, getMonthGrid } from "@wedwizz/core/date";
import { addMonths, formatDateLabel, MONTH_NAMES, parseDateKey, todayKey } from "./calendar";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import { FieldLabel } from "./field-label";
import { Sheet } from "./sheet";
import { AppText } from "./text";
import { colors, radius, size, space } from "./tokens";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface DateFieldProps {
  label: string;
  /** e.g. "optional", after the label. */
  note?: string;
  /** "YYYY-MM-DD", or "" for none. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest day that can be picked ("YYYY-MM-DD"). */
  minDate?: string;
  placeholder?: string;
  error?: string;
}

/** Date field that opens a month calendar (the phone's version of the web's <input type="date">). Can be cleared. */
export function DateField({ label, note, value, onChange, minDate, placeholder = "Choose a date", error }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <FieldLabel label={label} note={note} />
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDateLabel(value) : placeholder}`}
        accessibilityHint="Opens a calendar"
        style={[styles.box, { borderColor: error ? colors.danger : colors.lineStrong }]}
      >
        <CalendarDays size={20} color={colors.muted} />
        <AppText variant="lead" color={value ? "ink" : "muted"} style={styles.grow}>
          {value ? formatDateLabel(value) : placeholder}
        </AppText>
      </Pressable>
      {error && (
        <AppText variant="meta" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      <Sheet visible={open} title={label} onClose={() => setOpen(false)}>
        <Calendar
          value={value}
          minDate={minDate}
          onPick={(key) => {
            onChange(key);
            setOpen(false);
          }}
        />
        {value !== "" && (
          <Button
            label="Clear date"
            variant="link"
            onPress={() => {
              onChange("");
              setOpen(false);
            }}
            style={styles.clear}
          />
        )}
      </Sheet>
    </View>
  );
}

/** A month of days, Monday first (core getMonthGrid). Days before `minDate` can't be picked. */
export function Calendar({ value, minDate, onPick }: { value: string; minDate?: string; onPick: (key: string) => void }) {
  const start = parseDateKey(value) ?? parseDateKey(minDate ?? "") ?? parseDateKey(todayKey())!;
  const [shown, setShown] = useState({ year: start.year, month: start.month });
  const min = minDate ? parseDateKey(minDate) : null;
  const prev = addMonths(shown.year, shown.month, -1);
  const canGoBack = !min || prev.year * 12 + prev.month >= min.year * 12 + min.month;
  const today = todayKey();

  return (
    <View style={styles.calendar}>
      <View style={styles.monthRow}>
        <IconButton icon={ChevronLeft} label="Previous month" disabled={!canGoBack} onPress={() => setShown(prev)} />
        <AppText variant="bodyStrong" accessibilityLiveRegion="polite">
          {MONTH_NAMES[shown.month]} {shown.year}
        </AppText>
        <IconButton icon={ChevronRight} label="Next month" onPress={() => setShown(addMonths(shown.year, shown.month, 1))} />
      </View>
      <View style={styles.week}>
        {WEEKDAYS.map((d) => (
          <AppText key={d} variant="caption" color="muted" align="center" style={styles.cell}>
            {d}
          </AppText>
        ))}
      </View>
      {getMonthGrid(shown.year, shown.month).map((week, w) => (
        <View key={w} style={styles.week}>
          {week.map((day, i) => {
            if (day === null) return <View key={i} style={styles.cell} />;
            const key = formatDateKey(shown.year, shown.month, day);
            const disabled = minDate !== undefined && key < minDate;
            const selected = key === value;
            return (
              <Pressable
                key={i}
                disabled={disabled}
                onPress={() => onPick(key)}
                accessibilityRole="button"
                accessibilityLabel={formatDateLabel(key)}
                accessibilityState={{ selected, disabled }}
                style={[styles.cell, styles.day, selected && styles.selected, key === today && !selected && styles.today]}
              >
                <AppText variant={selected ? "bodyStrong" : "body"} color={selected ? "white" : disabled ? "lineStrong" : "ink"}>
                  {day}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: space.xs + 2 },
  box: {
    minHeight: size.control,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  grow: { flex: 1 },
  calendar: { gap: space.xs, paddingBottom: space.sm },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  week: { flexDirection: "row" },
  cell: { flex: 1, height: 44, alignItems: "center", justifyContent: "center" },
  day: { borderRadius: radius.full },
  selected: { backgroundColor: colors.brand },
  today: { borderWidth: 1.5, borderColor: colors.brand },
  clear: { alignSelf: "center" },
});
