// @ts-nocheck
import { VMOption, V86Starter } from "@woodenfish/libv86/build/libv86-debug";
// import "@woodenfish/libv86/build/libv86";
import v86Wasm from "@woodenfish/libv86/build/v86.wasm?url";
import bios from "@woodenfish/libv86/bios/seabios.bin?url";
import vgabios from "@woodenfish/libv86/bios/vgabios.bin?url";
import debian_fs from "../images/debian/10-full/?url";
import debian_state from "../images/debian/10-full/debian-state-base.bin.zst?url";
import alpine_cdrom from "../images/alpine/virt-3.17.2/alpine-virt-3.17.2-x86.iso?url";
import alpine_state from "../images/alpine/virt-3.17.2/v86state.bin.zst?url";
import { FitAddon } from "./xterm.fit";

window.DEBUG = true;

function getFsRoot() {
  const last = (debian_state as string).lastIndexOf("/");
  return "http://localhost:5173" + (debian_state as string).substring(0, last);
}

function wrapWasm(options) {
  return v86Wasm(options).then((instance) => instance.exports);
}

console.log("fs root", getFsRoot());

export function bootV86(option: VMOption) {
  const emulator = new V86Starter({
    bios: { url: bios },
    vga_bios: { url: vgabios },
    wasm_path: v86Wasm,
    vga_memory_size: 8 * 1024 * 1024,
    memory_size: 512 * 1024 * 1024,
    // filesystem: { base_url: getFsRoot() },
    initial_state: { url: debian_state },
    // bzimage_initrd_from_filesystem: true,
    // cmdline:
    //   "rw init=/bin/systemd root=host9p console=ttyS0 spectre_v2=off pti=off",
    filesystem: {
      // basefs: {
      //   url: getFsRoot() + "/debian-base-fs.json",
      // },
      use_pack: {
        prefix_length: 2,
      },
      baseurl: getFsRoot() + "/debian-9p-rootfs-pack-v2/",
    },
    // memory_size: 256 * 1024 * 1024,
    // cdrom: { url: alpine_cdrom },
    // initial_state: { url: alpine_state },
    // wasm_fn: wrapWasm,
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
