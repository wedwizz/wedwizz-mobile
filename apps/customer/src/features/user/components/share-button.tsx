import { Platform, Share } from "react-native";
import { Share2 } from "lucide-react-native";
import { IconButton, type IconButtonVariant } from "@wedwizz/ui";
import type { ShareContent } from "@wedwizz/core/share/listing-share";

/**
 * Shares a listing's public page with the phone's share sheet (web ShareButton). The web's own fallback sheet
 * (Copy link, WhatsApp) is for browsers without one; every phone has it. Needs no account.
 */
export function ShareButton({ url, title, text, variant = "surface" }: ShareContent & { variant?: IconButtonVariant }) {
  const share = () => {
    // iOS shares the link as its own item; Android only shares the message, so the link goes in it.
    const content = Platform.OS === "ios" ? { title, message: text, url } : { title, message: `${text} ${url}` };
    // Closing the sheet or a failure: nothing to do.
    void Share.share(content, { dialogTitle: `Share ${title}` }).catch(() => undefined);
  };
  return <IconButton icon={Share2} label={`Share ${title}`} variant={variant} onPress={share} />;
}
