import * as Ethernet from "./ethernet";
import * as IP from "./ip";
import * as ARP from "./arp";
import * as TCP from "./tcp";

let tcpRespCount = 0x7777;

// mock server state
// https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Protocol_operation
export enum State {
  LISTEN = 0,
  SYN_RECEIVED = 2,
  ESTABLISHED = 3,
  FIN_WAIT_1 = 4,
  FIN_WAIT_2 = 5,
  CLOSE_WAIT = 6,
  CLOSING = 7,
  LAST_ACK = 8,
  TIME_WAIT = 9,
  CLOSED = 10,
}

export class TCPSession {
  state: State;
  frame: Ethernet.Frame;
  ip: IP.Packet;
  ethSend?: (dst: Uint8Array, src: Uint8Array, type: Ethernet.EtherType, data: Uint8Array) => void;
  constructor(frame: Ethernet.Frame, ip: IP.Packet) {
    this.state = State.LISTEN;
    this.frame = frame;
    this.ip = ip;
  }

  linkToEth(ethSend: any) {
    this.ethSend = ethSend;
  }
  handleData(tcp: TCP.Packet) {
    if (tcp.syn && this.state === State.LISTEN) {
      this.state = State.ESTABLISHED;

      const tcpResp = TCP.encode(
        new Uint8Array(0),
        tcp.destinationPort,
        tcp.sourcePort,
        tcpRespCount++,
        tcp.sequenceNumber,
        TCP.Flags.ACK | TCP.Flags.SYN
      );

      const ip = IP.encode({
        version: 4,
        ihl: 5,
        dscp: 0,
        ecn: 0,
        identification: 0,
        flags: 0,
        fragmentOffset: 0,
        ttl: 40,
        protocol: IP.Protocol.TCP,
        sourceIp: this.ip.destinationIp,
        destinationIp: this.ip.sourceIp,
        data: tcpResp,
      });
      this.ethSend!(this.frame.src, this.frame.dst, Ethernet.EtherType.IPv4, ip);
      return;
    }
  }
}

const pool = new Map<string, TCPSession>();

export function getTCPSession(frame: Ethernet.Frame, ip: IP.Packet, tcp: TCP.Packet) {
  const key = `${tcp.sourcePort.toString(32)}.${tcp.destinationPort.toString(32)}.${ip.sourceIp}.${ip.destinationIp}`;
  if (!pool.has(key)) {
    const session = new TCPSession(frame, ip);
    pool.set(key, session);
  }
  return pool.get(key)!;
}
