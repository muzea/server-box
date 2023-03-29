import EventEmitter from "eventemitter3";
import * as IP from "./ip";
import * as TCP from "./tcp";
import * as bus from "./bus";
import * as utf8 from "../util/utf8";

let tcpRespCount = 0x7777;

// mock server state
// https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Protocol_operation
export enum State {
  LISTEN = 0,
  SYN_SENT = 1,
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

export class TCPServerSocket extends EventEmitter {
  state: State;
  nextSequenceNumber: number;
  lastAck: number;
  clientPort: number;
  clientIP: string;
  serverPort: number;
  constructor(clientPort: number, clientIP: string, serverPort: number) {
    super();
    this.state = State.LISTEN;
    this.nextSequenceNumber = tcpRespCount++;
    this.lastAck = 0;
    this.clientPort = clientPort;
    this.clientIP = clientIP;
    this.serverPort = serverPort;
  }

  handleData(tcp: TCP.Packet) {
    switch (this.state) {
      case State.LISTEN: {
        if (tcp.syn) {
          this.state = State.SYN_RECEIVED;
          this.lastAck = tcp.sequenceNumber + tcp.data.byteLength + 1;
          const tcpResp = TCP.encode(
            new Uint8Array(0),
            tcp.destinationPort,
            tcp.sourcePort,
            this.nextSequenceNumber,
            this.lastAck,
            TCP.Flags.ACK | TCP.Flags.SYN,
            [
              {
                kind: TCP.OptionKind.MSS,
                data: new Uint8Array([0x05, 0xb4]),
              },
              {
                kind: TCP.OptionKind.WS,
                data: new Uint8Array([0x08]),
              },
            ]
          );

          bus.sendIPPacketToVM(this.clientIP, tcpResp);
          this.nextSequenceNumber++;
          if (tcp.data.byteLength) {
            this.emit("data", tcp.data);
          }
        } else {
          console.error("tcp data error", tcp);
        }
        break;
      }
      case State.SYN_RECEIVED: {
        if (tcp.ack && tcp.acknowledgmentNumber === this.nextSequenceNumber) {
          this.state = State.ESTABLISHED;
          this.lastAck = tcp.sequenceNumber + tcp.data.byteLength;
          const tcpResp = TCP.encode(
            new Uint8Array(0),
            tcp.destinationPort,
            tcp.sourcePort,
            this.nextSequenceNumber,
            this.lastAck,
            TCP.Flags.ACK,
            []
          );
          if (tcp.data.byteLength) {
            this.emit("data", tcp.data);
          }
          bus.sendIPPacketToVM(this.clientIP, tcpResp);
        } else {
          console.error("tcp ESTABLISHED error", tcp);
        }
        break;
      }
      case State.ESTABLISHED: {
        if (tcp.fin) {
          this.state = State.CLOSE_WAIT;

          if (tcp.data.byteLength) {
            this.emit("data", tcp.data);
          }
          this.emit("end");
        } else if (tcp.data.byteLength) {
          this.emit("data", tcp.data);
        } else if (tcp.rst) {
          /**
           * @TODO
           */
          return;
        } else {
          console.error("tcp data error", tcp);
        }

        this.lastAck = tcp.sequenceNumber + tcp.data.byteLength;
        const tcpResp = TCP.encode(
          new Uint8Array(0),
          tcp.destinationPort,
          tcp.sourcePort,
          this.nextSequenceNumber,
          this.lastAck,
          TCP.Flags.ACK,
          []
        );

        bus.sendIPPacketToVM(this.clientIP, tcpResp);

        if (tcp.psh) {
          this.emit("PSH");
        }

        break;
      }
      case State.FIN_WAIT_1: {
        if (tcp.ack && tcp.acknowledgmentNumber === this.nextSequenceNumber) {
          if (tcp.fin) {
            this.state = State.TIME_WAIT;
          } else {
            this.state = State.FIN_WAIT_2;
          }
        }

        this.lastAck = tcp.sequenceNumber + tcp.data.byteLength;
        const tcpResp = TCP.encode(
          new Uint8Array(0),
          tcp.destinationPort,
          tcp.sourcePort,
          this.nextSequenceNumber,
          this.lastAck,
          TCP.Flags.ACK,
          []
        );

        bus.sendIPPacketToVM(this.clientIP, tcpResp);
        break;
      }
      case State.FIN_WAIT_2: {
        if (tcp.acknowledgmentNumber === this.nextSequenceNumber) {
          if (tcp.fin) {
            this.state = State.TIME_WAIT;

            this.lastAck = tcp.sequenceNumber + tcp.data.byteLength;
            const tcpResp = TCP.encode(
              new Uint8Array(0),
              tcp.destinationPort,
              tcp.sourcePort,
              this.nextSequenceNumber,
              this.lastAck,
              TCP.Flags.ACK,
              []
            );

            bus.sendIPPacketToVM(this.clientIP, tcpResp);
            this.removeAllListeners();
          }
        } else {
          console.error("socket active close error");
        }

        break;
      }
      case State.TIME_WAIT: {
        console.error("socket active close error");

        break;
      }
      case State.LAST_ACK: {
        if (tcp.ack && tcp.acknowledgmentNumber === this.nextSequenceNumber) {
          this.state = State.CLOSED;
          this.emit("close");
          this.removeAllListeners();
        } else {
          console.error("tcp close error", tcp);
        }
        break;
      }
    }
  }

  close() {
    switch (this.state) {
      case State.CLOSE_WAIT: {
        this.state = State.LAST_ACK;

        const tcpResp = TCP.encode(
          new Uint8Array(0),
          this.serverPort,
          this.clientPort,
          this.nextSequenceNumber,
          this.lastAck,
          TCP.Flags.FIN | TCP.Flags.ACK,
          []
        );

        bus.sendIPPacketToVM(this.clientIP, tcpResp);
        break;
      }
      case State.ESTABLISHED: {
        this.state = State.FIN_WAIT_1;

        const tcpResp = TCP.encode(
          new Uint8Array(0),
          this.serverPort,
          this.clientPort,
          this.nextSequenceNumber,
          this.lastAck,
          TCP.Flags.FIN | TCP.Flags.ACK,
          []
        );

        bus.sendIPPacketToVM(this.clientIP, tcpResp);
        break;
      }
    }
  }

  write(data: string | Uint8Array) {
    const payload = typeof data === "string" ? utf8.encodeToBytes(data) : data;
    console.log("tcp resp data ", data);
    const tcpResp = TCP.encode(
      payload,
      this.serverPort,
      this.clientPort,
      this.nextSequenceNumber,
      this.lastAck,
      TCP.Flags.PSH | TCP.Flags.ACK,
      []
    );

    bus.sendIPPacketToVM(this.clientIP, tcpResp);

    this.nextSequenceNumber += payload.byteLength;
  }
}

const serverPool = new Map<number, TCPServer>();

interface TCPServerOption {
  port: number;
}

class TCPServer extends EventEmitter {
  state: State;
  // to simplify the implementation
  // it is assumed that the requests come from within the VM, so the key only uses the client port
  connectionMap: Map<number, TCPServerSocket>;
  constructor() {
    super();
    this.state = State.LISTEN;
    this.connectionMap = new Map();
  }
  listen(options: TCPServerOption, callback: () => void) {
    serverPool.set(options.port, this);
    if (typeof callback === "function") callback();
  }
  handleData(ip: IP.Packet, tcp: TCP.Packet) {
    if (!this.connectionMap.has(tcp.sourcePort)) {
      const socket = new TCPServerSocket(tcp.sourcePort, ip.sourceIp, tcp.destinationPort);
      this.connectionMap.set(tcp.sourcePort, socket);
      this.emit("connection", socket);
    }
    this.connectionMap.get(tcp.sourcePort)!.handleData(tcp);
  }
}

export function createServer(): TCPServer {
  const server = new TCPServer();

  return server;
}

export function handleData(ip: IP.Packet, tcp: TCP.Packet) {
  const port = tcp.destinationPort;
  const server = serverPool.get(port);
  if (server) {
    server.handleData(ip, tcp);
  } else {
    console.error("cannot find server to handle tcp data", tcp);
  }
}
