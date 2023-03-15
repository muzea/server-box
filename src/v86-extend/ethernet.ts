// https://en.wikipedia.org/wiki/Ethernet_frame
// https://en.wikipedia.org/wiki/EtherType#Values

interface Frame {
  dst: Uint8Array;
  src: Uint8Array;
  type: number;
  data: Uint8Array;
}

export enum EtherType {
  IPv4 = 0x0800,
  ARP = 0x0806,
}

export function decode(buff: Uint8Array): Frame {
  return {
    dst: buff.subarray(0, 6),
    src: buff.subarray(6, 12),
    type: (buff[12] << 8) | buff[13],
    data: buff.subarray(14),
  };
}

export function encode(frame: Frame): Uint8Array {
  const len = Math.max(14 + frame.data.byteLength, 60);
  const buff = new Uint8Array(len);
  buff.fill(0);
  buff.set(frame.dst);
  buff.set(frame.src, 6);
  buff[12] = frame.type >> 8;
  buff[13] = frame.type & 0xff;
  buff.set(frame.data, 14);
  return buff;
}
