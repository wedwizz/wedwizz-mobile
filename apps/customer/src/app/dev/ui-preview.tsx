/**
 * Design system preview (step 4): every @wedwizz/ui component on one screen, to compare with the designs in design/customer.
 * Development builds only — release builds redirect to Home. Opened from the Profile tab's dev panel or wedwizz://dev/ui-preview.
 * The names, numbers and prices below are sample props for checking the look, not app content.
 */
import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lightbulb,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Search,
  Share2,
  ShoppingBag,
} from "lucide-react-native";
import {
  AppText,
  Button,
  Card,
  CategoryTile,
  ChipGroup,
  colors,
  Divider,
  EmptyState,
  ErrorState,
  HeartButton,
  IconButton,
  ListingCard,
  ListRow,
  LoadingState,
  OtpInput,
  PhoneField,
  Pill,
  Price,
  ProgressBar,
  Rating,
  Screen,
  SectionHeader,
  SegmentedTabs,
  space,
  TextField,
  ToggleSwitch,
  ToolTile,
  type TypeToken,
} from "@wedwizz/ui";

const swatches = ["brand", "brandDark", "brandWine", "ink", "muted", "line", "lineStrong", "tintPink", "soft", "star", "whatsapp", "ok", "danger"] as const;
const typeRows: TypeToken[] = ["hero", "title", "heading", "subheading", "cardTitle", "lead", "body", "bodyStrong", "meta", "label", "caption", "price", "button"];

const categories = [
  { label: "Venues", image: require("@/assets/images/venues.png") },
  { label: "Photographers", image: require("@/assets/images/photographers.png") },
  { label: "Makeup", image: require("@/assets/images/makeup.png") },
  { label: "Decorators", image: require("@/assets/images/decorators.png") },
  { label: "Catering", image: require("@/assets/images/catering.png") },
  { label: "Music", image: require("@/assets/images/music.png") },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionLabel}>
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

export default function UiPreview() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [chip, setChip] = useState("all");
  const [tab, setTab] = useState("gallery");
  const [saved, setSaved] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!__DEV__) return <Redirect href="/user/home" />;

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} label="Back" onPress={() => router.back()} />
        <AppText variant="heading">Design system</AppText>
      </View>

      <Section title="Colours">
        <View style={styles.wrap}>
          {swatches.map((name) => (
            <View key={name} style={styles.swatch}>
              <View style={[styles.swatchColor, { backgroundColor: colors[name] }]} />
              <AppText variant="caption">{name}</AppText>
              <AppText variant="caption" color="muted">
                {colors[name]}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type">
        {typeRows.map((variant) => (
          <AppText key={variant} variant={variant} numberOfLines={1}>
            {variant} — Plan Your Dream Wedding
          </AppText>
        ))}
      </Section>

      <Section title="Buttons">
        <Button label="Get OTP" iconRight={ArrowRight} fullWidth />
        <Button
          label="Verify & Login"
          iconRight={ArrowRight}
          fullWidth
          loading={loading}
          onPress={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        />
        <Button label="Disabled" fullWidth disabled />
        <View style={styles.row}>
          <Button label="Check Dates" variant="outline" size="sm" />
          <Button label="Enable Location Access" variant="outline" size="sm" iconLeft={MapPin} />
        </View>
        <View style={styles.row}>
          <Button label="Explore Now" size="sm" iconRight={ArrowRight} />
          <Button label="Soft" variant="soft" size="sm" />
          <Button label="Try again" variant="neutral" size="sm" />
          <Button label="View all" variant="link" iconRight={ArrowRight} />
        </View>
        <View style={styles.row}>
          <Button label="Message" iconLeft={MessageCircle} style={styles.grow} />
          <IconButton icon={MessageCircle} label="WhatsApp" variant="whatsapp" diameter={56} />
          <IconButton icon={Phone} label="Call" variant="brandOutline" diameter={56} />
        </View>
      </Section>

      <Section title="Icon buttons">
        <View style={styles.row}>
          <IconButton icon={ArrowLeft} label="Back" />
          <IconButton icon={MessageSquareText} label="Messages" dot />
          <IconButton icon={MessageSquareText} label="Messages" badge={3} />
          <IconButton icon={Share2} label="Share" variant="surface" />
          <HeartButton active={saved} label="The Grand Royal" onPress={() => setSaved((s) => !s)} />
        </View>
        <View style={[styles.row, styles.photoStrip]}>
          <IconButton icon={ChevronLeft} label="Previous photo" variant="overlay" />
          <HeartButton active={saved} label="The Grand Royal" variant="plain" onPress={() => setSaved((s) => !s)} />
          <IconButton icon={ChevronRight} label="Next photo" variant="overlay" />
        </View>
      </Section>

      <Section title="Fields">
        <PhoneField
          dialCode="+91"
          flag="🇮🇳"
          onPressCountry={() => undefined}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
          placeholder="Enter your phone number"
          accessibilityLabel="Mobile number"
        />
        <TextField label="Your name" placeholder="As it should appear" />
        <TextField label="With error" value="98765" error="Enter a valid 10-digit mobile number." />
        <TextField placeholder="Search venues and vendors" leading={<Search size={20} color={colors.muted} />} accessibilityLabel="Search" />
        <OtpInput value={otp} onChange={setOtp} />
        <OtpInput value={["1", "2", "3", "4", "5", "6"]} onChange={() => undefined} invalid />
      </Section>

      <Section title="Selection">
        <ChipGroup
          accessibilityLabel="Status"
          value={chip}
          onChange={setChip}
          options={[
            { value: "all", label: "All" },
            { value: "new", label: "New" },
            { value: "replied", label: "Replied" },
            { value: "booked", label: "Booked" },
            { value: "lost", label: "Lost" },
          ]}
        />
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "gallery", label: "Gallery" },
            { value: "packages", label: "Packages" },
            { value: "about", label: "About" },
            { value: "reviews", label: "Reviews" },
          ]}
        />
        <View style={styles.row}>
          <ToggleSwitch checked={toggle} onChange={setToggle} label="Sample switch" />
          <View style={styles.grow}>
            <ProgressBar value={62} label="Checklist progress" />
          </View>
        </View>
        <View style={styles.row}>
          <Pill label="Wedding Essentials" tone="brand" />
          <Pill label="Action needed" tone="action" />
          <Pill label="Waiting" tone="waiting" />
          <Pill label="Confirmed" tone="ok" />
          <Pill label="Closed" tone="neutral" />
        </View>
      </Section>

      <Section title="Content">
        <View style={styles.wrapTight}>
          {categories.map((c) => (
            <CategoryTile key={c.label} label={c.label} image={c.image} onPress={() => undefined} />
          ))}
          <CategoryTile label="No image" image={null} onPress={() => undefined} />
        </View>
        <SectionHeader title="Featured Venues in Kochi" onAction={() => undefined} />
        <View style={styles.row}>
          <ListingCard
            name="The Grand Royal"
            image={require("@/assets/images/venue_card.png")}
            imageAlt="The Grand Royal wedding venue"
            location="Kochi, Kerala"
            rating={4.8}
            reviewCount={124}
            price={150000}
            note="Up to 800 guests"
            actionLabel="view details"
            onPress={() => undefined}
            favourite={<HeartButton active={saved} label="The Grand Royal" onPress={() => setSaved((s) => !s)} />}
            style={styles.grow}
          />
          <ListingCard
            name="No photo, no price"
            image={null}
            imageAlt="Listing without photos"
            subtitle="Photographers"
            location="3.2 km away"
            rating={null}
            price={null}
            verified
            actionLabel="view profile"
            onPress={() => undefined}
            style={styles.grow}
          />
        </View>
        <View style={styles.row}>
          <ToolTile label="Checklist" icon={CalendarCheck} detail="12 of 40 done" onPress={() => undefined} />
          <ToolTile label="Shortlisted Vendors" icon={Heart} onPress={() => undefined} />
          <ToolTile label="Inspiration Board" icon={Lightbulb} onPress={() => undefined} />
          <ToolTile label="Market Saved Ideas" icon={ShoppingBag} onPress={() => undefined} />
        </View>
        <View style={styles.row}>
          <Rating rating={4.8} reviews={342} reviewsLabel="reviews" />
          <Rating rating={null} />
          <Rating rating={4.6} reviews={98} variant="pill" />
        </View>
        <Price amount={25000} unit="starting price" />
        <Price amount={1200} prefix="From" unit="per plate" originalAmount={1500} />
        <Card>
          <AppText variant="heading">Check Availability</AppText>
          <Divider />
          <AppText variant="body" color="muted">
            Plain card: white, border, soft shadow.
          </AppText>
          <Divider dashed />
          <ListRow icon={MapPin} label="Thevara, Kochi, Kerala - 682013" tone="tint" onPress={() => undefined} />
        </Card>
        <ListRow icon={CalendarCheck} label="My bookings" detail="2 upcoming" onPress={() => undefined} />
      </Section>

      <Section title="Page states">
        <LoadingState cards={2} />
        <Card padding={0}>
          <EmptyState title="No favourites yet" body="Tap the heart on a venue or vendor to save it here." actionLabel="Browse vendors" onAction={() => undefined} />
        </Card>
        <Card padding={0}>
          <ErrorState onRetry={() => undefined} />
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm, marginLeft: -space.md },
  section: { gap: space.md, paddingVertical: space.xl, borderBottomWidth: 1, borderBottomColor: colors.line },
  sectionLabel: { letterSpacing: 1 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space.sm },
  grow: { flex: 1 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  wrapTight: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  swatch: { width: 96, gap: space.xxs },
  swatchColor: { height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line },
  photoStrip: { justifyContent: "space-between", backgroundColor: colors.brandWine, padding: space.md, borderRadius: 14 },
});
