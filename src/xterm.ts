// @ts-nocheck
import { WebglAddon } from "xterm-addon-webgl";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { FitAddon } from "xterm-addon-fit";

export class SerialAdapterXtermJS {
  constructor(element, bus) {
    this.element = element;

    if (!window["Terminal"]) {
      return;
    }

    const term = new window["Terminal"]({ allowProposedApi: true });
    this.term = term;
    term.options.logLevel = "off";

    const on_data_disposable = term["onData"](function (data) {
      for (let i = 0; i < data.length; i++) {
        bus.send("serial0-input", data.charCodeAt(i));
      }
    });

    bus.register(
      "serial0-output-char",
      function (chr: string) {
        const buff = new Uint8Array(1);
        buff[0] = chr.charCodeAt(0);

        term.write(buff);
      },
      this
    );

    this.destroy = function () {
      on_data_disposable["dispose"]();
      term["dispose"]();
    };
  }
  show() {
    this.term && this.term.open(this.element);
    this.term.loadAddon(new WebglAddon());

    const fitAddon = new FitAddon();
    const unicode11Addon = new Unicode11Addon();

    this.term.loadAddon(fitAddon);
    this.term.loadAddon(unicode11Addon);
    fitAddon.fit();
    this.term.unicode.activeVersion = "11";
  }
}
