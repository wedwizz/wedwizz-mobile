import { IntroCarousel, type IntroSlide } from "@wedwizz/ui";

export interface IntroViewProps {
  slides: IntroSlide[];
  onSkip: () => void;
  onFinish: () => void;
}

/** The intro slides from the onboarding designs: photo, kicker, serif title, text, dots, Continue, and Skip. */
export function IntroView({ slides, onSkip, onFinish }: IntroViewProps) {
  return <IntroCarousel slides={slides} onSkip={onSkip} onFinish={onFinish} />;
}
