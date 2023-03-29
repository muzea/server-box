import * as Ethernet from "./ethernet";
import * as ARP from "./arp";
import * as IP from "./ip";
import * as TCP from "./tcp";

let _bus: {
  register(name: string, callback: (data: Uint8Array) => void): void;
  send(name: string, data: Uint8Array): void;
};

export function buffToHex(data: Uint8Array) {
  return [...data].map((it) => it.toString(16).padStart(2, "0")).join("");
}

export function getEthBus() {
  return _bus;
}

export function setEthBus(bus: any) {
  _bus = bus;
}

const arpMap = new Map<string, Uint8Array>();

export function updateARPMap(mac: Uint8Array, ip: string) {
  // mac data must be stored at new buffer space
  arpMap.set(ip, mac.slice());
}

export function sendEthernetFrameToVM(dst: Uint8Array, src: Uint8Array, type: Ethernet.EtherType, data: Uint8Array) {
  const resp = Ethernet.encode({
    dst,
    src,
    type,
    data,
  });

  console.log("eth recive ", buffToHex(resp));
  _bus.send("net0-receive", resp);
}
let count = 0x1010;

export function sendIPPacketToVM(destinationIp: string, data: Uint8Array) {
  const pseudoHeader = new ArrayBuffer(12);
  const pseudoView = new DataView(pseudoHeader);

  // source ip
  pseudoView.setUint8(0, 192);
  pseudoView.setUint8(1, 168);
  pseudoView.setUint8(2, 1);
  pseudoView.setUint8(3, 100);

  // destination ip
  destinationIp.split(".").map((str, index) => pseudoView.setUint8(4 + index, parseInt(str, 10)));

  // zero
  pseudoView.setUint8(8, 0);

  // protocol
  pseudoView.setUint8(9, IP.Protocol.TCP);
  pseudoView.setUint16(10, data.byteLength);

  TCP.updateChecksum(data, new Uint8Array(pseudoHeader));

  const resp = IP.encode({
    version: 4,
    ihl: 5,
    dscp: 0,
    ecn: 0,
    identification: ++count,
    flags: 0b010,
    fragmentOffset: 0,
    ttl: 128,
    protocol: IP.Protocol.TCP,
    sourceIp: ARP.FakeIpString,
    destinationIp: destinationIp,
    data,
  });

  const dst = arpMap.get(destinationIp);
  if (dst) {
    sendEthernetFrameToVM(dst, ARP.FakeMacBuff, Ethernet.EtherType.IPv4, resp);
  } else {
    console.error("cannot find mac address via ip");
  }
}
