// @ts-nocheck
import { V86Starter } from "v86";
import v86Wasm from "v86/build/v86.wasm?init";
import bios from "v86/bios/seabios.bin?url";
import vgabios from "v86/bios/vgabios.bin?url";
import cdrom from "../images/alpine/virt-3.17.2/alpine-virt-3.17.2-x86.iso?url";
// import state from "../images/alpine/virt-3.17.2/v86state.bin?url";
import state from "../images/alpine/virt-3.17.2/v86state.bin.zst?url";
import { Starter, VMOption } from "./vm";
import { FitAddon } from "./xterm.fit";

window.DEBUG = true;


function wrapWasm(options) {
  return v86Wasm(options).then((instance) => instance.exports);
}

export function bootV86(option: VMOption) {
  const emulator: Starter = new V86Starter({
    wasm_fn: wrapWasm,
    memory_size: 256 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    cdrom: { url: cdrom },
    initial_state: { url: state },
    autostart: true,
    ...option,
  });

  window.emulator = emulator;
  const fitAddon = new FitAddon();

  emulator.add_listener("emulator-ready", async function () {
    console.log(performance.now());

    emulator.serial_adapter.term.reset();
    setTimeout(() => {
      emulator.serial_adapter.term.loadAddon(fitAddon);
      fitAddon.fit();
      emulator.serial0_send("\n");
    }, 0);
  });

  return emulator;
}
