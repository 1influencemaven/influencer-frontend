import type {
  ContactChannel,
  ContactChannelType,
} from "@/types/lead-discovery";

export const CHANNEL_DISPLAY_ORDER: ContactChannelType[] = [
  "LINKEDIN",
  "EMAIL",
  "WEBSITE",
];

const TYPE_SORT_ORDER: Record<ContactChannelType, number> = {
  LINKEDIN: 0,
  EMAIL: 1,
  WEBSITE: 2,
};

/** Active channel types present on a lead, deduped and in display order. */
export function getActiveChannelTypes(
  channels: ContactChannel[],
): ContactChannelType[] {
  const present = new Set<ContactChannelType>();
  for (const channel of channels) {
    if (channel.status === "ACTIVE") {
      present.add(channel.type);
    }
  }
  return CHANNEL_DISPLAY_ORDER.filter((type) => present.has(type));
}

/** Active channels sorted by display order (LINKEDIN → EMAIL → WEBSITE). */
export function getActiveChannelsOrdered(
  channels: ContactChannel[],
): ContactChannel[] {
  return channels
    .filter((channel) => channel.status === "ACTIVE")
    .sort((left, right) => {
      const orderDiff =
        TYPE_SORT_ORDER[left.type] - TYPE_SORT_ORDER[right.type];
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return left.createdAt.localeCompare(right.createdAt);
    });
}

/** First active channel of a given type, if any. */
export function getActiveChannelByType(
  channels: ContactChannel[],
  type: ContactChannelType,
): ContactChannel | undefined {
  return getActiveChannelsOrdered(channels).find(
    (channel) => channel.type === type,
  );
}

/** All active email channels in display order. */
export function getActiveEmailChannels(
  channels: ContactChannel[],
): ContactChannel[] {
  return getActiveChannelsOrdered(channels).filter(
    (channel) => channel.type === "EMAIL",
  );
}

export function hasActiveEmailChannel(channels: ContactChannel[]): boolean {
  return channels.some(
    (channel) => channel.type === "EMAIL" && channel.status === "ACTIVE",
  );
}
