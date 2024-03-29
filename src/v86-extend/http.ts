// Copy from https://github.com/nodejs/node/blob/main/lib/_http_server.js
// https://en.wikipedia.org/wiki/HTTP

import httpz from "http-z";
import { decodeFromBytes } from "../util/utf8";
import * as TCPSession from "./tcp-session";

const STATUS_CODES = {
  100: "Continue", // RFC 7231 6.2.1
  101: "Switching Protocols", // RFC 7231 6.2.2
  102: "Processing", // RFC 2518 10.1 (obsoleted by RFC 4918)
  103: "Early Hints", // RFC 8297 2
  200: "OK", // RFC 7231 6.3.1
  201: "Created", // RFC 7231 6.3.2
  202: "Accepted", // RFC 7231 6.3.3
  203: "Non-Authoritative Information", // RFC 7231 6.3.4
  204: "No Content", // RFC 7231 6.3.5
  205: "Reset Content", // RFC 7231 6.3.6
  206: "Partial Content", // RFC 7233 4.1
  207: "Multi-Status", // RFC 4918 11.1
  208: "Already Reported", // RFC 5842 7.1
  226: "IM Used", // RFC 3229 10.4.1
  300: "Multiple Choices", // RFC 7231 6.4.1
  301: "Moved Permanently", // RFC 7231 6.4.2
  302: "Found", // RFC 7231 6.4.3
  303: "See Other", // RFC 7231 6.4.4
  304: "Not Modified", // RFC 7232 4.1
  305: "Use Proxy", // RFC 7231 6.4.5
  307: "Temporary Redirect", // RFC 7231 6.4.7
  308: "Permanent Redirect", // RFC 7238 3
  400: "Bad Request", // RFC 7231 6.5.1
  401: "Unauthorized", // RFC 7235 3.1
  402: "Payment Required", // RFC 7231 6.5.2
  403: "Forbidden", // RFC 7231 6.5.3
  404: "Not Found", // RFC 7231 6.5.4
  405: "Method Not Allowed", // RFC 7231 6.5.5
  406: "Not Acceptable", // RFC 7231 6.5.6
  407: "Proxy Authentication Required", // RFC 7235 3.2
  408: "Request Timeout", // RFC 7231 6.5.7
  409: "Conflict", // RFC 7231 6.5.8
  410: "Gone", // RFC 7231 6.5.9
  411: "Length Required", // RFC 7231 6.5.10
  412: "Precondition Failed", // RFC 7232 4.2
  413: "Payload Too Large", // RFC 7231 6.5.11
  414: "URI Too Long", // RFC 7231 6.5.12
  415: "Unsupported Media Type", // RFC 7231 6.5.13
  416: "Range Not Satisfiable", // RFC 7233 4.4
  417: "Expectation Failed", // RFC 7231 6.5.14
  418: "I'm a Teapot", // RFC 7168 2.3.3
  421: "Misdirected Request", // RFC 7540 9.1.2
  422: "Unprocessable Entity", // RFC 4918 11.2
  423: "Locked", // RFC 4918 11.3
  424: "Failed Dependency", // RFC 4918 11.4
  425: "Too Early", // RFC 8470 5.2
  426: "Upgrade Required", // RFC 2817 and RFC 7231 6.5.15
  428: "Precondition Required", // RFC 6585 3
  429: "Too Many Requests", // RFC 6585 4
  431: "Request Header Fields Too Large", // RFC 6585 5
  451: "Unavailable For Legal Reasons", // RFC 7725 3
  500: "Internal Server Error", // RFC 7231 6.6.1
  501: "Not Implemented", // RFC 7231 6.6.2
  502: "Bad Gateway", // RFC 7231 6.6.3
  503: "Service Unavailable", // RFC 7231 6.6.4
  504: "Gateway Timeout", // RFC 7231 6.6.5
  505: "HTTP Version Not Supported", // RFC 7231 6.6.6
  506: "Variant Also Negotiates", // RFC 2295 8.1
  507: "Insufficient Storage", // RFC 4918 11.5
  508: "Loop Detected", // RFC 5842 7.2
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended", // RFC 2774 7
  511: "Network Authentication Required", // RFC 6585 6
} as Record<number, string>;

class SimpleResponse {
  protocolVersion: string;
  statusCode?: number;
  statusMessage?: string;
  headers: httpz.HttpZHeader[];
  body: string;

  connection: TCPSession.TCPSocket;
  constructor(connection: TCPSession.TCPSocket) {
    this.connection = connection;
    this.headers = [];
    this.body = "";
    this.protocolVersion = "HTTP/1.1";
  }
  writeHead(statusCode: number, headers: Record<string, string>) {
    this.statusCode = statusCode;
    this.statusMessage = STATUS_CODES[statusCode] || STATUS_CODES[500];
    this.headers = [];

    Object.entries(headers).forEach((it) => {
      this.headers.push({
        name: it[0],
        value: it[1],
      });
    });
  }
  end(data: string | Uint8Array) {
    if (typeof data === "string") {
      this.body += data;
    } else {
    }

    this.headers.push({
      name: "Content-Length",
      value: this.body.length.toString(),
    });
    this.connection.write(
      httpz.build({
        protocolVersion: this.protocolVersion!,
        statusCode: this.statusCode!,
        statusMessage: this.statusMessage!,
        headers: this.headers!,
        body: {
          contentType: "text/plain",
          boundary: "",
          params: [],
          text: this.body,
        },
      })
    );

    this.connection.close();
    this.connection.removeAllListeners();
  }
}

class SimpleServer {
  handler: (req: httpz.HttpZRequestModel, resp: SimpleResponse) => void;
  constructor(handler: (req: httpz.HttpZRequestModel, resp: SimpleResponse) => void) {
    this.handler = handler;
  }

  listen(port: number) {
    const server = TCPSession.createServer();

    server.on("connection", (c: TCPSession.TCPSocket) => {
      const requestBuffer = new ArrayBuffer(4 * 1024);
      const uint8 = new Uint8Array(requestBuffer);
      let offset = 0;
      console.log("client connected");
      // @ts-ignore
      window.conn = c;
      c.on("data", (data: Uint8Array) => {
        uint8.set(data, offset);
        offset += data.byteLength;
        console.log("client send data ", data);
      });
      c.on("PSH", () => {
        console.log("client data with PSH");
        const request = httpz.parse(decodeFromBytes(new Uint8Array(requestBuffer, 0, offset)));

        console.log("parsed http request", request);

        this.handler(request as httpz.HttpZRequestModel, new SimpleResponse(c));
      });
      c.on("end", () => {
        console.log("client disconnected");
        const request = httpz.parse(decodeFromBytes(new Uint8Array(requestBuffer, 0, offset)));

        console.log("parsed http request", request);

        this.handler(request as httpz.HttpZRequestModel, new SimpleResponse(c));
      });
    });

    server.listen({ port }, () => {
      console.log("server bound");
    });
  }
}

export function createServer(fn: (req: httpz.HttpZRequestModel, resp: SimpleResponse) => void): SimpleServer {
  return new SimpleServer(fn);
}

/**
 * @TODO url parse
 * @param url now must be IP address
 * @param options
 * @param callback
 */
export function get(url: string, options: any, callback: () => void) {
  const client = TCPSession.createClient();
  let responeBuffer = new ArrayBuffer(4 * 1024);
  let uint8 = new Uint8Array(responeBuffer);
  let offset = 0;
  client.connect(80, url, () => {
    console.log("connected to server");
    client.on("data", (data: Uint8Array) => {
      uint8.set(data, offset);
      offset += data.byteLength;
    });

    client.on("PSH", () => {
      console.log("httpget respone\n", decodeFromBytes(new Uint8Array(responeBuffer, 0, offset)));
    });
    client.on("end", () => {
      console.log("httpget respone\n", decodeFromBytes(new Uint8Array(responeBuffer, 0, offset)));
    });
    client.write("GET / HTTP/1.1\r\n\r\n");
  });
}
