import { Stack } from "expo-router";
import { colors } from "@wedwizz/ui";
import { EnquirySheet } from "@/features/user/components/enquiry-sheet";
import { useCustomerAreaGate } from "@/features/user/routes/guards";

/**
 * Every /user screen. A signed-in customer without a saved profile goes to setup first (web CustomerArea).
 * The compose sheet lives here once (web: EnquiryModal in the user root), so stacked detail pages never open two.
 */
export default function UserLayout() {
  useCustomerAreaGate();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }} />
      <EnquirySheet />
    </>
  );
}
