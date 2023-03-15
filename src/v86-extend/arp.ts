// https://en.wikipedia.org/wiki/Address_Resolution_Protocol
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
