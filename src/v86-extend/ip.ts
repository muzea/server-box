// https://github.com/onomondo/tcp-packet/blob/master/index.js
// TODO tcp

// Copy from https://github.com/mafintosh/ip-packet/blob/master/index.js

interface Options {
  allowNullChecksum: boolean;
}

const opts: Options = {
  allowNullChecksum: true,
};

interface Packet {
  version: number;
  ihl: number;
  dscp: number;
  ecn: number;
  length: number;
  identification: number;
  flags: number;
  fragmentOffset: number;
  ttl: number;
  protocol: number;
  checksum: number;
  sourceIp: string;
  destinationIp: string;
  data: ArrayBuffer;
}

function encode(packet: Packet) {
  let buf = new ArrayBuffer(encodingLength(packet));
  let offset = 0;

  const view = new DataView(buf);

  //   buf[offset] = (packet.version << 4) | (packet.ihl || 5);
  view.setUint8(offset, (packet.version << 4) | (packet.ihl || 5));
  //   buf[offset + 1] = ((packet.dscp || 0) << 2) | (packet.ecn || 0);
  view.setUint8(offset + 1, ((packet.dscp || 0) << 2) | (packet.ecn || 0));
  // buf.writeUInt16BE(20 + packet.data.byteLength, offset + 2);
  view.setUint16(offset + 2, 20 + packet.data.byteLength, false);
  // buf.writeUInt16BE(packet.identification || 0, offset + 4);
  view.setUint16(offset + 4, packet.identification || 0, false);
  // buf.writeUInt16BE(
  //   ((packet.flags || 0) << 13) | (packet.fragmentOffset || 0),
  //   offset + 6
  // );
  view.setUint16(offset + 6, ((packet.flags || 0) << 13) | (packet.fragmentOffset || 0), false);
  //   buf[offset + 8] = packet.ttl || 0;
  view.setUint8(offset + 8, packet.ttl || 0);
  //   buf[offset + 9] = packet.protocol || 0;
  view.setUint8(offset + 9, packet.protocol || 0);
  // buf.writeUInt16BE(0, offset + 10);
  view.setUint16(offset + 10, 0, false);
  encodeIp(packet.sourceIp, view, offset + 12);
  encodeIp(packet.destinationIp, view, offset + 16);
  // buf.writeUInt16BE(checksum(buf, offset, offset + 20), offset + 10);
  view.setUint16(offset + 10, checksum(view, offset, offset + 20), false);
  // packet.data.copy(buf, offset + 20);
  new Uint8Array(buf).set(new Uint8Array(packet.data), 20);
  return buf;
}

function decode(buf: Uint8Array) {
  let offset = 0;
  const view = new DataView(buf.buffer.slice(buf.byteOffset, buf.byteLength + buf.byteOffset));
  let version = view.getUint8(offset) >> 4;

  if (version !== 4) {
    throw new Error("Currently only IPv4 is supported");
  }
  var ihl = view.getUint8(offset) & 15;
  if (ihl > 5) throw new Error("Currently only IHL <= 5 is supported");
  // var length = buf.readUInt16BE(offset + 2);
  const length = view.getUint16(offset + 2, false);
  // var decodedChecksum = buf.readUInt16BE(offset + 10);
  const decodedChecksum = view.getUint16(offset + 10, false);
  var ignoreChecksum = opts.allowNullChecksum && decodedChecksum === 0;

  if (!ignoreChecksum) {
    var sum = checksum(view, offset, offset + 20);

    if (sum) throw new Error("Bad checksum (" + sum + ")");
  }

  return {
    version: version,
    ihl: ihl,
    dscp: view.getUint8(offset + 1) >> 2,
    ecn: view.getUint8(offset + 1) & 3,
    length: length,
    identification: view.getUint16(offset + 4, false),
    flags: view.getUint8(offset + 6) >> 5,
    fragmentOffset: view.getUint16(offset + 6, false) & 8191,
    ttl: view.getUint8(offset + 8),
    protocol: view.getUint8(offset + 9),
    checksum: decodedChecksum,
    sourceIp: decodeIp(view, offset + 12),
    destinationIp: decodeIp(view, offset + 16),
    data: buf.slice(offset + 20, offset + length),
  };
}

function encodingLength(packet: Packet) {
  return 20 + packet.data.byteLength;
}

function encodeIp(addr: string, view: DataView, offset: number) {
  for (var i = 0; i < 4; i++) {
    var oct = parseInt(addr, 10);
    view.setUint8(offset++, oct);
    addr = addr.slice(oct < 100 ? (oct < 10 ? 2 : 3) : 4);
  }
}

function decodeIp(view: DataView, offset: number) {
  return (
    view.getUint8(offset) +
    "." +
    view.getUint8(offset + 1) +
    "." +
    view.getUint8(offset + 2) +
    "." +
    view.getUint8(offset + 3)
  );
}

function checksum(view: DataView, offset: number, end: number) {
  var sum = 0;
  for (; offset < end; offset += 2) sum += view.getUint16(offset, false);
  while (true) {
    var carry = sum >> 16;
    if (!carry) break;
    sum = (sum & 0xffff) + carry;
  }
  return ~sum & 0xffff;
}

export { encode, decode };
