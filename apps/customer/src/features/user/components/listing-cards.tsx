import type { ReactNode } from "react";
import { ListingCard } from "@wedwizz/ui";
import type { ListingCardView } from "@/features/user/lib/catalog-view";

interface CardProps {
  card: ListingCardView;
  onPress: () => void;
  /** The wired heart (FavouriteButton). */
  favourite: ReactNode;
  /** Fixed width in rails; grids and lists leave it out. */
  width?: number;
  imageHeight?: number;
}

/** Web VenueCard's content on the design's card: distance (Near me) or area, rating, price per day, capacity. */
export function VenueCard({ card, onPress, favourite, width, imageHeight }: CardProps) {
  return (
    <ListingCard
      width={width}
      imageHeight={imageHeight}
      name={card.name}
      image={card.image}
      imageAlt={`${card.name} wedding venue`}
      location={card.distanceLabel ?? card.area}
      rating={card.rating}
      reviewCount={card.reviewCount}
      price={card.startingPrice}
      priceUnit={card.priceUnit}
      note={card.capacity !== null ? `Up to ${card.capacity} guests` : undefined}
      onPress={onPress}
      actionLabel="view details"
      favourite={favourite}
    />
  );
}

/** Web VendorCard's content on the design's card: category, distance or city, rating, "From" price, verified badge. */
export function VendorCard({ card, onPress, favourite, width, imageHeight }: CardProps) {
  return (
    <ListingCard
      width={width}
      imageHeight={imageHeight}
      name={card.name}
      image={card.image}
      imageAlt={`${card.name} work sample`}
      subtitle={card.categoryLabel}
      location={card.distanceLabel ?? card.city}
      rating={card.rating}
      reviewCount={card.reviewCount}
      price={card.startingPrice}
      priceUnit={card.priceUnit}
      pricePrefix="From"
      verified={card.verified}
      onPress={onPress}
      actionLabel="view profile"
      favourite={favourite}
    />
  );
}
