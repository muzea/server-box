// https://en.wikipedia.org/wiki/Address_Resolution_Protocol
// https://datatracker.ietf.org/doc/html/rfc2390

const FakeMac = [0x00, 0x50, 0x56, 0xef, 0x7b, 0xe0];
export const FakeIpBuff = new Uint8Array([192, 168, 1, 1]);
export const FakeMacBuff = new Uint8Array(FakeMac);

interface Arp {
  HTYPE: number;
  PTYPE: number;

  HLEN: number;
  PLEN: number;

  OPER: number;

  SHA: Uint8Array;
  SPA: Uint8Array;

  THA: Uint8Array;
  TPA: Uint8Array;
}

export function decode(buff: Uint8Array) {
  return {
    HTYPE: (buff[0] << 8) | buff[1],
    PTYPE: (buff[2] << 8) | buff[3],

    HLEN: buff[4],
    PLEN: buff[5],

    OPER: (buff[6] << 8) | buff[7],

    SHA: buff.subarray(8, 14),
    SPA: buff.subarray(14, 18),

    THA: buff.subarray(18, 24),
    TPA: buff.subarray(24, 28),
  };
}

export function encode(arp: Arp) {
  const buff = new Uint8Array(28);

  buff[0] = arp.HTYPE >> 8;
  buff[1] = arp.HTYPE & 0xff;

  buff[2] = arp.PTYPE >> 8;
  buff[3] = arp.PTYPE & 0xff;

  buff[4] = arp.HLEN;
  buff[5] = arp.PLEN;

  buff[6] = arp.OPER >> 8;
  buff[7] = arp.OPER & 0xff;

  buff.set(arp.SHA, 8);
  buff.set(arp.SPA, 14);

  buff.set(arp.THA, 18);
  buff.set(arp.TPA, 24);
  return buff;
}
