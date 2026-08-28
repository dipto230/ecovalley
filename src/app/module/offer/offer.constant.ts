import { OfferStatus } from "../../../generated/prisma/client";

export const OFFER_STATUS_TRANSITIONS: Record<
  OfferStatus,
  OfferStatus[]
> = {
  [OfferStatus.PENDING]: [
    OfferStatus.ACCEPTED,
    OfferStatus.REJECTED,
    OfferStatus.CANCELLED,
  ],

  [OfferStatus.ACCEPTED]: [
    OfferStatus.CANCELLED,
  ],

  [OfferStatus.REJECTED]: [],

  [OfferStatus.CANCELLED]: [],
};