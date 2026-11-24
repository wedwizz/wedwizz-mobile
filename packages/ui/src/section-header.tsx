import { StyleSheet, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { Button } from "./button";
import { AppText } from "./text";
import { space } from "./tokens";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows the link on the right ("View all →"). */
  onAction?: () => void;
  actionLabel?: string;
}

/** Section title with an optional "View all" link (web SectionHeading; arrow from the home design). */
export function SectionHeader({ title, subtitle, onAction, actionLabel = "View all" }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="meta" color="muted">
            {subtitle}
          </AppText>
        )}
      </View>
      {onAction && (
        <Button variant="link" label={actionLabel} iconRight={ArrowRight} onPress={onAction} accessibilityLabel={`${actionLabel}: ${title}`} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: space.md, marginBottom: space.md },
  text: { flexShrink: 1, gap: space.xxs },
});
