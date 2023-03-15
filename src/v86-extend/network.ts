import * as IP from "./ip";
import * as Ethernet from "./ethernet";
import * as ARP from "./arp";

class NetworkAdapter {
  bus: any;
  constructor(bus: any) {
    this.bus = bus;

    // this.bus.send("net0-receive", new Uint8Array(0));
  }
}

function buffToHex(data: Uint8Array) {
  return [...data].map((it) => it.toString(16).padStart(2, "0")).join("");
}

export default function createNetworkAdapter(bus: any) {
  bus.register("net0-send", function (data: Uint8Array) {
    try {
      const frame = Ethernet.decode(data);
      console.log("receive ethernet frame ", frame.type.toString(16).padStart(4, "0"));
      switch (frame.type) {
        case Ethernet.EtherType.IPv4: {
          // IPv4
          console.log("IPv4 send", buffToHex(data));
          console.log("IPv4 decode", IP.decode(frame.data));
          break;
        }
        case Ethernet.EtherType.ARP: {
          // ARP
          const arp = ARP.decode(frame.data);
          const resp = Ethernet.encode({
            dst: frame.src,
            src: ARP.FakeMacBuff,
            type: Ethernet.EtherType.ARP,
            data: ARP.encode({
              HTYPE: arp.HTYPE,
              PTYPE: arp.PTYPE,

              HLEN: arp.HLEN,
              PLEN: arp.PLEN,

              OPER: 2,

              SHA: ARP.FakeMacBuff,
              SPA: arp.TPA,

              THA: arp.SHA,
              TPA: arp.SPA,
            }),
          });
          console.log("ARP send", buffToHex(data));
          console.log("ARP receive", buffToHex(resp));
          console.log("ARP decode", arp);

          debugger;
          bus.send("net0-receive", resp);
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
