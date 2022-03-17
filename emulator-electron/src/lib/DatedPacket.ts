import { SOS } from "sos-plugin-types";
import { ord as Ord, date as D } from "fp-ts";

export type DatedPacket = SOS.Packet & {
  date: Date;
};

export const isDatedPacket = (packet: any): packet is DatedPacket =>
  "data" in packet && "event" in packet && "date" in packet;

export const ordDatedPacket: Ord.Ord<DatedPacket> = Ord.fromCompare((a, b) =>
  D.Ord.compare(a.date, b.date)
);
