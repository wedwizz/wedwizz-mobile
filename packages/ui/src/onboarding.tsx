/**
 * Looks from the onboarding designs (2026-11-22): the intro slides and the three setup steps. Cream page, serif titles,
 * wine accents, fields with the label inside the box.
 */
import { useRef, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type ViewInstance,
  type ScrollViewInstance,
  type TextInputProps,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Minus, Plus, type LucideIcon } from "lucide-react-native";
import { Button } from "./button";
import { formatDateLabel } from "./calendar";
import { Calendar } from "./date-field";
import { SafeImage } from "./safe-image";
import { OptionSheet, Sheet, type SelectOption } from "./sheet";
import { AppText } from "./text";
import { colors, fonts, radius, shadow, size, space } from "./tokens";

// ——— Intro slides ———

export interface IntroSlide {
  key: string;
  /** A URL or a bundled image (require). */
  image: string | number;
  alt: string;
  kicker: string;
  title: string;
  body: string;
}

interface IntroCarouselProps {
  slides: IntroSlide[];
  onSkip: () => void;
  /** Continue on the last slide. */
  onFinish: () => void;
}

/** Swipeable intro: a photo with rounded bottom corners and a Skip pill, the text under it, dots, and Continue. */
export function IntroCarousel({ slides, onSkip, onFinish }: IntroCarouselProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pager = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;
  const photoHeight = Math.round(height * 0.56);

  const next = () => {
    if (last) return onFinish();
    pager.current?.scrollTo({ x: width * (index + 1), animated: true });
    setIndex(index + 1);
  };

  return (
    <View style={styles.cream}>
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.fill}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={{ width }}>
            <SafeImage source={slide.image} alt={slide.alt} style={[styles.introPhoto, { height: photoHeight }]} />
            <View style={styles.introText}>
              <AppText variant="label" color="wine">
                {slide.kicker}
              </AppText>
              <AppText variant="serifHeading" accessibilityRole="header">
                {slide.title}
              </AppText>
              <AppText variant="body" color="muted">
                {slide.body}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip the introduction"
        hitSlop={8}
        style={({ pressed }) => [styles.skip, { top: insets.top + space.md }, pressed && styles.pressed]}
      >
        <AppText variant="label" color="white">
          Skip
        </AppText>
      </Pressable>
      <View style={[styles.introFooter, { paddingBottom: insets.bottom + space.lg }]}>
        <PageDots count={slides.length} index={index} />
        <Button label="Continue" variant="wine" iconRight={ArrowRight} onPress={next} fullWidth />
      </View>
    </View>
  );
}

/** Slide dots: the current one is a wide wine pill. */
export function PageDots({ count, index }: { count: number; index: number }) {
  return (
    <View style={styles.dots} accessible accessibilityLabel={`Page ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
      ))}
    </View>
  );
}

// ——— Setup steps ———

interface OnboardingStepLayoutProps {
  step: number;
  total: number;
  /** Hidden when there is no step to go back to. */
  onBack?: () => void;
  kicker: string;
  title: string;
  lead: string;
  children: ReactNode;
  /** Pinned at the bottom, above the keyboard (the Continue button). */
  footer: ReactNode;
}

/** One setup step: back circle, "Step 1 of 3", the wine progress bar, a serif title, the content, and a pinned button. */
export function OnboardingStepLayout({ step, total, onBack, kicker, title, lead, children, footer }: OnboardingStepLayoutProps) {
  return (
    <SafeAreaView style={styles.cream} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.fill} behavior="padding">
        <View style={styles.stepHeader}>
          {onBack ? (
            <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={4} style={({ pressed }) => [styles.backCircle, pressed && styles.pressed]}>
              <ChevronLeft size={22} color={colors.ink} />
            </Pressable>
          ) : (
            <View style={styles.headerSpace} />
          )}
          <AppText variant="label" color="muted" style={styles.stepLabel}>
            {`Step ${step} of ${total}`}
          </AppText>
          <View style={styles.headerSpace} />
        </View>
        <View
          style={styles.stepTrack}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Setup progress"
          accessibilityValue={{ min: 0, max: total, now: step }}
        >
          <View style={[styles.stepFill, { width: `${(step / total) * 100}%` }]} />
        </View>
        <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled">
          <AppText variant="label" color="wine">
            {kicker}
          </AppText>
          <AppText variant="serifTitle" accessibilityRole="header" style={styles.stepTitle}>
            {title}
          </AppText>
          <AppText variant="meta" color="muted">
            {lead}
          </AppText>
          <View style={styles.stepBody}>{children}</View>
        </ScrollView>
        <View style={styles.stepFooter}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export interface ChoiceTileOption<T extends string> {
  value: T;
  label: string;
  /** The letter in the tile's badge. */
  letter: string;
}

interface ChoiceGridProps<T extends string> {
  /** Read by screen readers for the group ("I am the"). */
  accessibilityLabel: string;
  options: ChoiceTileOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
}

/** Big choice tiles, two per row: a letter badge and a label; the chosen one gets a wine border and a tick. */
export function ChoiceGrid<T extends string>({ accessibilityLabel, options, value, onChange, error }: ChoiceGridProps<T>) {
  const rows: ChoiceTileOption<T>[][] = [];
  for (let i = 0; i < options.length; i += 2) rows.push(options.slice(i, i + 2));
  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {rows.map((row) => (
        <View key={row[0].value} style={styles.gridRow}>
          {row.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                style={({ pressed }) => [styles.tile, selected && styles.tileSelected, error !== undefined && !value && styles.tileError, pressed && styles.pressed]}
              >
                <View style={styles.letter}>
                  <AppText variant="serifHeading" color="wine" style={styles.letterText}>
                    {option.letter}
                  </AppText>
                </View>
                <AppText variant="bodyStrong" color={selected ? "wine" : "ink"}>
                  {option.label}
                </AppText>
                {selected && <Check size={18} color={colors.wine} style={styles.tick} />}
              </Pressable>
            );
          })}
          {row.length === 1 && <View style={styles.fill} />}
        </View>
      ))}
      {error && <FieldError text={error} />}
    </View>
  );
}

function FieldError({ text }: { text: string }) {
  return (
    <AppText variant="meta" color="danger" accessibilityLiveRegion="polite">
      {text}
    </AppText>
  );
}

const fieldLabel = (label: string, note?: string) => (note ? `${label} · ${note}` : label);

/** The designs' field: white box, the small wine label inside it above the value. */
function InsetBox({ label, focused, error, children }: { label: string; focused?: boolean; error?: string; children: ReactNode }) {
  return (
    <View style={styles.insetWrap}>
      <View style={[styles.insetBox, focused && styles.insetFocused, error !== undefined && styles.insetError]}>
        <AppText variant="caption" color="wine">
          {label}
        </AppText>
        {children}
      </View>
      {error && <FieldError text={error} />}
    </View>
  );
}

interface InsetTextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  /** e.g. "Optional", after the label. */
  note?: string;
  error?: string;
}

export function InsetTextField({ label, note, error, onFocus, onBlur, ...props }: InsetTextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <InsetBox label={fieldLabel(label, note)} focused={focused} error={error}>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={colors.lineStrong}
        selectionColor={colors.wine}
        cursorColor={colors.wine}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={styles.insetInput}
      />
    </InsetBox>
  );
}

interface InsetSelectFieldProps<T extends string> {
  label: string;
  note?: string;
  options: SelectOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  placeholder: string;
  error?: string;
}

/** Inset field that opens a list to choose from (City). */
export function InsetSelectField<T extends string>({ label, note, options, value, onChange, placeholder, error }: InsetSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${chosen?.label ?? placeholder}`}
        accessibilityHint="Opens a list to choose from"
      >
        <InsetBox label={fieldLabel(label, note)} error={error}>
          <View style={styles.insetRow}>
            <AppText variant="body" color={chosen ? "ink" : "muted"} numberOfLines={1} style={styles.fill}>
              {chosen?.label ?? placeholder}
            </AppText>
            <ChevronRight size={20} color={colors.ink} />
          </View>
        </InsetBox>
      </Pressable>
      <OptionSheet visible={open} title={label} options={options} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
    </>
  );
}

interface InsetDateFieldProps {
  label: string;
  note?: string;
  /** "YYYY-MM-DD", or "" for none. */
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  placeholder?: string;
  error?: string;
}

/** Inset field that opens a month calendar; the date can be cleared. */
export function InsetDateField({ label, note, value, onChange, minDate, placeholder = "Choose a date", error }: InsetDateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDateLabel(value) : placeholder}`}
        accessibilityHint="Opens a calendar"
      >
        <InsetBox label={fieldLabel(label, note)} error={error}>
          <View style={styles.insetRow}>
            <AppText variant="body" color={value ? "ink" : "muted"} style={styles.fill}>
              {value ? formatDateLabel(value) : placeholder}
            </AppText>
            <CalendarDays size={20} color={colors.ink} />
          </View>
        </InsetBox>
      </Pressable>
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
    </>
  );
}

/** A label on the left and a value on the right, not editable (the signed-in phone number). */
export function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.readOnly} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="caption" color="muted">
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

/** Rose card with an icon in a white square ("No date yet?"). */
export function InfoNote({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <View style={styles.note} accessible accessibilityLabel={`${title} ${body}`}>
      <View style={styles.noteIcon}>
        <Icon size={20} color={colors.wine} />
      </View>
      <View style={styles.fill}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" color="muted">
          {body}
        </AppText>
      </View>
    </View>
  );
}

/** White card with a rose icon square, a small label and the chosen value, then its control. */
export function EstimateCard({ icon: Icon, label, value, children }: { icon: LucideIcon; label: string; value: string; children: ReactNode }) {
  return (
    <View style={styles.estimate}>
      <View style={styles.estimateHead}>
        <View style={styles.estimateIcon}>
          <Icon size={22} color={colors.wine} />
        </View>
        <View style={styles.fill}>
          <AppText variant="caption" color="muted">
            {label}
          </AppText>
          <AppText variant="subheading">{value}</AppText>
        </View>
      </View>
      {children}
    </View>
  );
}

interface StepperProps {
  /** Read by screen readers ("Estimated guests"). */
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
}

/** − value + in a rounded box. */
export function Stepper({ label, value, onDecrease, onIncrease, canDecrease, canIncrease }: StepperProps) {
  return (
    <View
      style={styles.stepper}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "increment" && canIncrease) onIncrease();
        if (e.nativeEvent.actionName === "decrement" && canDecrease) onDecrease();
      }}
    >
      <Pressable onPress={onDecrease} disabled={!canDecrease} hitSlop={8} style={[styles.stepperButton, !canDecrease && styles.dim]}>
        <Minus size={20} color={colors.wine} />
      </Pressable>
      <AppText variant="bodyStrong" align="center" style={styles.fill}>
        {value}
      </AppText>
      <Pressable onPress={onIncrease} disabled={!canIncrease} hitSlop={8} style={[styles.stepperButton, !canIncrease && styles.dim]}>
        <Plus size={20} color={colors.wine} />
      </Pressable>
    </View>
  );
}

interface StopSliderProps {
  /** Read by screen readers ("Estimated budget"). */
  label: string;
  /** How many stops; `index` is one of 0…count-1. */
  count: number;
  index: number;
  onChange: (index: number) => void;
  /** The chosen stop, read by screen readers. */
  valueText: string;
  startLabel: string;
  endLabel: string;
}

const THUMB = 22;

/** A slider that snaps to a few stops (drag or tap), with the end labels under it. */
export function StopSlider({ label, count, index, onChange, valueText, startLabel, endLabel }: StopSliderProps) {
  const track = useRef<ViewInstance>(null);
  const latest = useRef({ index, onChange, count });
  latest.current = { index, onChange, count };

  const responder = useRef(
    (() => {
      const geometry = { x: 0, width: 1 };
      const pick = (pageX: number) => {
        const { count: n, index: current, onChange: change } = latest.current;
        const ratio = Math.max(0, Math.min(1, (pageX - geometry.x) / geometry.width));
        const next = Math.round(ratio * (n - 1));
        if (next !== current) change(next);
      };
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Keep the drag when the finger drifts up or down (the page scrolls vertically).
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const pageX = e.nativeEvent.pageX;
          track.current?.measure((_x, _y, width, _h, px) => {
            geometry.x = px;
            geometry.width = Math.max(1, width);
            pick(pageX);
          });
        },
        onPanResponderMove: (e) => pick(e.nativeEvent.pageX),
      });
    })(),
  ).current;

  const percent = count > 1 ? (index / (count - 1)) * 100 : 0;
  return (
    <View>
      <View
        {...responder.panHandlers}
        style={styles.slider}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: valueText }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "increment" && index < count - 1) onChange(index + 1);
          if (e.nativeEvent.actionName === "decrement" && index > 0) onChange(index - 1);
        }}
      >
        <View ref={track} style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${percent}%` }]} />
        </View>
        <View pointerEvents="none" style={[styles.thumb, { left: `${percent}%` }]} />
      </View>
      <View style={styles.sliderEnds}>
        <AppText variant="caption" color="muted">
          {startLabel}
        </AppText>
        <AppText variant="caption" color="muted">
          {endLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  cream: { flex: 1, backgroundColor: colors.cream },
  pressed: { opacity: 0.7 },
  dim: { opacity: 0.3 },

  introPhoto: { width: "100%", borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: "hidden" },
  introText: { paddingHorizontal: space.xxl, paddingTop: space.xxl, gap: space.sm },
  skip: {
    position: "absolute",
    right: space.screen,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    backgroundColor: colors.scrim,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  introFooter: { paddingHorizontal: space.xxl, gap: space.xxl },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: space.sm },
  dot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.lineStrong },
  dotActive: { width: 24, backgroundColor: colors.wine },

  stepHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.screen, paddingTop: space.sm },
  backCircle: {
    width: size.iconButton,
    height: size.iconButton,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  headerSpace: { width: size.iconButton, height: size.iconButton },
  stepLabel: { flex: 1, textAlign: "center" },
  stepTrack: { height: 6, marginHorizontal: space.screen, marginTop: space.lg, borderRadius: radius.full, backgroundColor: colors.line, overflow: "hidden" },
  stepFill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.wine },
  stepContent: { paddingHorizontal: space.screen, paddingTop: space.xxl, paddingBottom: space.xxl },
  stepTitle: { marginTop: space.xs, marginBottom: space.xs },
  stepBody: { marginTop: space.xxl, gap: space.md },
  stepFooter: { paddingHorizontal: space.screen, paddingTop: space.sm, paddingBottom: space.md },

  grid: { gap: space.md },
  gridRow: { flexDirection: "row", gap: space.md },
  tile: {
    flex: 1,
    minHeight: 100,
    padding: space.lg,
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  tileSelected: { borderWidth: 2, borderColor: colors.wine, backgroundColor: colors.soft },
  tileError: { borderColor: colors.danger },
  tick: { position: "absolute", top: space.md, right: space.md },
  letter: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", backgroundColor: colors.roseSoft },
  letterText: { fontSize: 18, lineHeight: 22 },

  insetWrap: { gap: space.xs },
  insetBox: {
    minHeight: 60,
    justifyContent: "center",
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    gap: space.xxs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  insetFocused: { borderColor: colors.wine },
  insetError: { borderColor: colors.danger },
  insetInput: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink, paddingVertical: 2 },
  insetRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  clear: { alignSelf: "center", marginVertical: space.md },

  readOnly: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: space.xs, paddingVertical: space.xs },

  note: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.roseSoft, marginTop: space.sm },
  noteIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },

  estimate: { padding: space.lg, gap: space.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, boxShadow: shadow.card },
  estimateHead: { flexDirection: "row", alignItems: "center", gap: space.md },
  estimateIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.roseSoft },

  stepper: { flexDirection: "row", alignItems: "center", height: 52, paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  stepperButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },

  slider: { height: 32, justifyContent: "center", marginHorizontal: THUMB / 2 },
  sliderTrack: { height: 4, borderRadius: radius.full, backgroundColor: colors.line, overflow: "hidden" },
  sliderFill: { height: "100%", backgroundColor: colors.wine },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    marginLeft: -THUMB / 2,
    borderRadius: radius.full,
    backgroundColor: colors.wine,
    borderWidth: 4,
    borderColor: colors.white,
    boxShadow: shadow.raised,
  },
  sliderEnds: { flexDirection: "row", justifyContent: "space-between", marginTop: space.xs },
});
