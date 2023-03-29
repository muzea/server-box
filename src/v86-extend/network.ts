import * as Ethernet from "./ethernet";
import * as IP from "./ip";
import * as ARP from "./arp";
import * as TCP from "./tcp";
import * as bus from "./bus";
import * as TCPSession from "./tcp-session";
import * as HTTP from "./http";

export default function createNetworkAdapter(_bus: any) {
  bus.setEthBus(_bus);

  bus.getEthBus().register("net0-send", function (data: Uint8Array) {
    try {
      const frame = Ethernet.decode(data);
      console.log("receive ethernet frame ", frame.type.toString(16).padStart(4, "0"));
      switch (frame.type) {
        case Ethernet.EtherType.IPv4: {
          // IPv4
          console.log("IPv4 send", bus.buffToHex(data));
          const packet = IP.decode(frame.data);
          switch (packet.protocol) {
            case IP.Protocol.TCP: {
              const tcp = TCP.decode(packet.data);

              TCPSession.handleData(packet, tcp);
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
          bus.updateARPMap(arp.SHA, arp.SPA.join("."));
          // return a fake data
          bus.sendEthernetFrameToVM(
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

  HTTP.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Hello World\n");
  }).listen(80);

  return true;
}
