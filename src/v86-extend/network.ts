import * as Ethernet from "./ethernet";
import * as IP from "./ip";
import * as ARP from "./arp";
import * as TCP from "./tcp";
import * as TCPSession from "./tcp-session";

function buffToHex(data: Uint8Array) {
  return [...data].map((it) => it.toString(16).padStart(2, "0")).join("");
}

let bus: {
  register(name: string, callback: (data: Uint8Array) => void): void;
  send(name: string, data: Uint8Array): void;
};

function sendEthernetFrameToVM(dst: Uint8Array, src: Uint8Array, type: Ethernet.EtherType, data: Uint8Array) {
  const resp = Ethernet.encode({
    dst,
    src,
    type,
    data,
  });

  console.log("eth recive ", buffToHex(resp));
  bus.send("net0-receive", resp);
}

export default function createNetworkAdapter(_bus: any) {
  bus = _bus;
  bus.register("net0-send", function (data: Uint8Array) {
    try {
      const frame = Ethernet.decode(data);
      console.log("receive ethernet frame ", frame.type.toString(16).padStart(4, "0"));
      switch (frame.type) {
        case Ethernet.EtherType.IPv4: {
          // IPv4
          console.log("IPv4 send", buffToHex(data));
          console.log("Ethernet data", buffToHex(frame.data));
          const packet = IP.decode(frame.data);
          console.log("IPv4 decode", packet);
          console.log("IP data", buffToHex(packet.data));
          switch (packet.protocol) {
            case IP.Protocol.TCP: {
              const tcp = TCP.decode(packet.data);
              console.log("tcp decode ", tcp);
              console.log("TCP data", buffToHex(tcp.data));
              const cuurrentSession = TCPSession.getTCPSession(frame, packet, tcp);
              if (cuurrentSession.state === TCPSession.State.LISTEN) {
                cuurrentSession.linkToEth(sendEthernetFrameToVM);
              }

              cuurrentSession.handleData(tcp);
              break;
            }
            case IP.Protocol.UDP: {
              break;
            }
          }
          break;
        }
        case Ethernet.EtherType.ARP: {
          // ARP
          const arp = ARP.decode(frame.data);

          // return a fake data
          sendEthernetFrameToVM(
            frame.src,
            ARP.FakeMacBuff,
            Ethernet.EtherType.ARP,
            ARP.encode({
              HTYPE: arp.HTYPE,
              PTYPE: arp.PTYPE,

              HLEN: arp.HLEN,
              PLEN: arp.PLEN,

              OPER: 2,

              SHA: ARP.FakeMacBuff,
              SPA: arp.TPA,

              THA: arp.SHA,
              TPA: arp.SPA,
            })
          );
          // console.log("ARP send", buffToHex(data));
          // console.log("ARP decode", arp);
          break;
        }

        default:
          {
            // console.log("drop Ethernet frame", frame);
          }
          break;
      }
    } catch (error) {
      console.error(error);
    }
  });

  return true;
}
