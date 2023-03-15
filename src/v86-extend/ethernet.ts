// https://en.wikipedia.org/wiki/Ethernet_frame
// https://en.wikipedia.org/wiki/EtherType#Values

export function decode(buff: Uint8Array) {
  return {
    dst: buff.subarray(0, 6),
    src: buff.subarray(6, 12),
    type: (buff[12] << 8) | buff[13],
    data: buff.subarray(14),
  };
}
