// @ts-nocheck
// import { VMOption, V86Starter } from "@woodenfish/libv86/build/libv86-debug";
import { VMOption, V86Starter } from "@woodenfish/libv86";
import v86Wasm from "@woodenfish/libv86/build/v86.wasm?url";
import bios from "@woodenfish/libv86/bios/seabios.bin?url";
import vgabios from "@woodenfish/libv86/bios/vgabios.bin?url";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { WebglAddon } from "xterm-addon-webgl";
import { FitAddon } from "xterm-addon-fit";
import qs from "qs";
import { fetchArrayBuffer, fetchJson } from "./util/cache";
import fs9p from "./fs";

const CDN_ROOT = "https://misaka.wooden.fish/";
// const Local = "/temp_fs/debian-10-slim/";
const Local = "/temp_fs/";

const query = qs.parse(window.location.search.slice(1));
const isLocal = query.local && true;

const DEBIAN_ROOT = isLocal ? Local : CDN_ROOT;

function gethddFile() {
  return DEBIAN_ROOT + "linux.img";
}

function getStateFile() {
  return DEBIAN_ROOT + "linux-state.bin.zst";
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
  fs9p.install();

  const initialStateBuffer = await fetchArrayBuffer(getStateFile());
  const biosBuffer = await fetchArrayBuffer(bios);
  const vgabiosBuffer = await fetchArrayBuffer(vgabios);
  const debianBuffer = await fetchArrayBuffer(gethddFile());

  const emulator = new V86Starter({
    bios: { buffer: biosBuffer },
    vga_bios: { buffer: vgabiosBuffer },
    wasm_path: v86Wasm,
    vga_memory_size: 8 * 1024 * 1024,
    memory_size: 512 * 1024 * 1024,
    initial_state: {
      buffer: initialStateBuffer,
    },
    hda: {
      buffer: debianBuffer,
    },
    filesystem: fs9p,
    autostart: true,
    // Mouse disabled, undo if you want to interact with the screen
    disable_mouse: true,
    // Keyboard disabled, undo if you want to type in screen
    disable_keyboard: true,
    // Disable sound
    disable_speaker: true,
    ...option,
  });

  window.emulator = emulator;
  window.saveState = async () => {
    const ab = await emulator.save_state();
    const name = "linux-state.bin";
    var blob = new Blob([ab]);

    var a = document.createElement("a");
    a["download"] = name;
    a.href = window.URL.createObjectURL(blob);
    a.dataset["downloadurl"] = ["application/octet-stream", a["download"], a.href].join(":");

    a.click();
    window.URL.revokeObjectURL(a.src);
  };
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
