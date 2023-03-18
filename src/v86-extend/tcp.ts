// Copy from https://github.com/onomondo/tcp-packet
// https://en.wikipedia.org/wiki/Transmission_Control_Protocol

export enum Flags {
  CWR = 0b1000_0000,
  ECE = 0b0100_0000,
  URG = 0b0010_0000,
  ACK = 0b0001_0000,
  PSH = 0b0000_1000,
  RST = 0b0000_0100,
  SYN = 0b0000_0010,
  FIN = 0b0000_0001,
}

export function encode(
  data: Uint8Array,
  sourcePort: number,
  destinationPort: number,
  sequenceNumber: number,
  acknowledgmentNumber: number,
  flags: number
): Uint8Array {
  const dataLength = data ? data.length : 0;
  const len = 20 + dataLength;
  const buff = new ArrayBuffer(len + (len % 2));
  const packet = new Uint8Array(buff, 0, len);
  const view = new DataView(packet.buffer, packet.byteOffset);
  packet[0] = sourcePort >> 8;
  packet[1] = sourcePort & 0xff;

  packet[2] = destinationPort >> 8;
  packet[3] = destinationPort & 0xff;

  view.setUint32(4, sequenceNumber);
  view.setUint32(8, acknowledgmentNumber);

  // Data offset 4bit & Reserved 4bit
  packet[12] = 0x50;
  // CWR ECE URG ACK PSH RST SYN FIN
  packet[13] = flags;

  // Window Size 16bit
  packet[14] = 0xfa;
  packet[15] = 0xf0;

  // Checksum 16bit
  // packet[16] = 0;
  // packet[17] = 0;

  // Urgent pointer 16bit
  // packet[18] = 0;
  // packet[19] = 0;
  packet.set(data, 20);
  return packet;
}

export function updateChecksum(buff: Uint8Array, pseudoHeader: Uint8Array) {
  let sum = 0;
  const pseudoView = new DataView(pseudoHeader.buffer, pseudoHeader.byteOffset);
  const buffView = new DataView(buff.buffer, buff.byteOffset);

  for (let offset = 0; offset < pseudoHeader.byteLength; offset += 2) sum += pseudoView.getUint16(offset, false);
  for (let offset = 0; offset < buffView.byteLength; offset += 2) sum += buffView.getUint16(offset, false);

  while (true) {
    const carry = sum >> 16;
    if (!carry) break;
    sum = (sum & 0xffff) + carry;
  }
  const checksum = ~sum & 0xffff;

  buffView.setUint16(16, checksum);
}

// https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xhtml#tcp-parameters-1
enum OptionKind {
  /**
   * 	End of Option List
   */
  EOL = 0,
  /**
   * 	No-Operation
   */
  NOP = 1,
}

interface Option {
  kind: number;
  data?: Uint8Array;
}

export function decode(buffer: Uint8Array) {
  const view = new DataView(buffer.buffer, buffer.byteOffset);
  const sourcePort = view.getUint16(0);
  const destinationPort = view.getUint16(2);

  const sequenceNumber = view.getUint32(4);
  const acknowledgmentNumber = view.getUint32(8);
  const dataOffset = (buffer[12] >> 4) & 15;
  const reserved = (buffer[12] >> 1) & 7;
  const flags = buffer[13];
  const ns = (flags >> 8) & 1;
  const cwr = (flags >> 7) & 1;
  const ece = (flags >> 6) & 1;
  const urg = (flags >> 5) & 1;
  const ack = (flags >> 4) & 1;
  const psh = (flags >> 3) & 1;
  const rst = (flags >> 2) & 1;
  const syn = (flags >> 1) & 1;
  const fin = flags & 1;
  const windowSize = view.getUint16(14);
  const checksum = view.getUint16(16);
  const urgentPointer = view.getUint16(18);
  const dataOffsetAsBytes = dataOffset * 4;

  const options: Option[] = [];
  if (dataOffsetAsBytes > 20) {
    let optionIndex = 20;
    while (optionIndex < dataOffsetAsBytes) {
      const kind = buffer[optionIndex];
      optionIndex++;
      if (kind === OptionKind.NOP) {
        options.push({ kind });
        continue;
      }

      const size = buffer[optionIndex];
      optionIndex++;
      if (size === 2) {
        options.push({ kind });
        continue;
      }

      options.push({
        kind,
        data: buffer.subarray(optionIndex, optionIndex + size - 2),
      });

      optionIndex += size - 2;
    }
  }

  const data = buffer.slice(dataOffsetAsBytes, buffer.length);

  return {
    sourcePort,
    destinationPort,
    sequenceNumber,
    acknowledgmentNumber,
    dataOffset,
    flags,
    reserved,
    ns,
    cwr,
    ece,
    urg,
    ack,
    psh,
    rst,
    syn,
    fin,
    windowSize,
    checksum,
    urgentPointer,
    options,
    data,
  };
}

export type Packet = ReturnType<typeof decode>;
