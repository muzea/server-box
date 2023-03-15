import * as IP from "./ip";
import * as Ethernet from "./ethernet";
import * as ARP from "./arp";

class NetworkAdapter {
  bus: any;
  constructor(bus: any) {
    this.bus = bus;

    this.bus.register(
      "net0-send",
      function (data: Uint8Array) {
        // console.log("network data", [...data].map((it) => it.toString(16).padStart(2, "0")).join(""));
        try {
          const frame = Ethernet.decode(data);
          console.log("receive ethernet frame ", frame.type.toString(16).padStart(4, "0"));
          switch (frame.type) {
            case 0x0800: {
              // IPv4
              console.log("IPv4 decode", IP.decode(frame.data));
              break;
            }
            case 0x0806: {
              // ARP
              console.log("ARP decode", ARP.decode(frame.data));
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
      },
      this
    );

    // this.bus.send("net0-receive", new Uint8Array(0));
  }
}

export default function createNetworkAdapter(bus: any) {
  return new NetworkAdapter(bus);
}
