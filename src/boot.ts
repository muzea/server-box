// @ts-nocheck
// import { VMOption, V86Starter } from "@woodenfish/libv86/build/libv86-debug";
import { VMOption, V86Starter } from "@woodenfish/libv86";
import v86Wasm from "@woodenfish/libv86/build/v86.wasm?url";
import bios from "@woodenfish/libv86/bios/seabios.bin?url";
import vgabios from "@woodenfish/libv86/bios/vgabios.bin?url";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { WebglAddon } from 'xterm-addon-webgl';
// import { FitAddon } from "./xterm.fit";
import { FitAddon } from "xterm-addon-fit";
import { fetchArrayBuffer } from "./util/cache";

const JS_DELIVR =
  "https://cdn.jsdelivr.net/gh/muzea-demo/server-box-image@b1be2655acc0890179326b61ad783d5c9f6ea518/debian-10-full/";
const GITHUB_RAW =
  "https://raw.githubusercontent.com/muzea-demo/server-box-image/b1be2655acc0890179326b61ad783d5c9f6ea518/debian-10-full/";
const Local = "/temp_fs/debian-10-slim/";

const isLocal = window.location.search.indexOf("local") >= 0;
const isJsDelivr = window.location.search.indexOf("jsdelivr") >= 0;

const DEBIAN_ROOT = isLocal ? Local : isJsDelivr ? JS_DELIVR : GITHUB_RAW;

function getFsRoot() {
  return DEBIAN_ROOT + "rootfs-pack/";
}

function getStateFile() {
  return DEBIAN_ROOT + "state.bin.zst";
}

class SerialAdapterXtermJS {
  constructor(element, bus) {
    this.element = element;

    if (!window["Terminal"]) {
      return;
    }

    const term = new window["Terminal"]({ allowProposedApi: true });
    this.term = term;
    term.options.logLevel = "off";
    term.write("This is the serial console. Whatever you type or paste here will be sent to COM1");

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
  }
}

export async function bootV86(option: VMOption) {
  const initialStateBuffer = await fetchArrayBuffer(getStateFile());
  const biosBuffer = await fetchArrayBuffer(bios);
  const vgabiosBuffer = await fetchArrayBuffer(vgabios);
  const emulator = new V86Starter({
    // bios: { url: bios },
    // vga_bios: { url: vgabios },
    bios: { buffer: biosBuffer },
    vga_bios: { buffer: vgabiosBuffer },
    wasm_path: v86Wasm,
    vga_memory_size: 8 * 1024 * 1024,
    memory_size: 512 * 1024 * 1024,
    // initial_state: { url: getStateFile() },
    initial_state: {
      buffer: initialStateBuffer,
    },
    filesystem: {
      use_pack: {
        prefix_length: 2,
        idb_key: "server_box_fs",
      },
      baseurl: getFsRoot(),
    },
    autostart: true,
    ...option,
  });

  window.emulator = emulator;
  emulator.serial_adapter = new SerialAdapterXtermJS(document.getElementById("terminal"), emulator.bus);
  const fitAddon = new FitAddon();
  const unicode11Addon = new Unicode11Addon();

  emulator.add_listener("emulator-ready", async function () {
    console.log(performance.now());

    setTimeout(() => {
      const term = emulator.serial_adapter.term;
      term.loadAddon(fitAddon);
      term.loadAddon(unicode11Addon);
      fitAddon.fit();
      term.unicode.activeVersion = "11";
    }, 0);
  });

  return emulator;
}
