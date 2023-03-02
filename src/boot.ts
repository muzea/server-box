// @ts-nocheck
import { VMOption, V86Starter } from "@woodenfish/libv86";
import v86Wasm from "@woodenfish/libv86/build/v86.wasm?url";
import bios from "@woodenfish/libv86/bios/seabios.bin?url";
import vgabios from "@woodenfish/libv86/bios/vgabios.bin?url";

import { FitAddon } from "./xterm.fit";
import { KV } from "./util/idb";

const JS_DELIVR =
  "https://cdn.jsdelivr.net/gh/muzea-demo/server-box-image@b1be2655acc0890179326b61ad783d5c9f6ea518/debian-10-full/";
const GITHUB_RAW =
  "https://raw.githubusercontent.com/muzea-demo/server-box-image/b1be2655acc0890179326b61ad783d5c9f6ea518/debian-10-full/";
const Local = "/temp_fs/debian-10-full/";

const isLocal = window.location.search.indexOf("local") >= 0;
const isJsDelivr = window.location.search.indexOf("jsdelivr") >= 0;

const DEBIAN_ROOT = isLocal ? Local : isJsDelivr ? JS_DELIVR : GITHUB_RAW;

function getFsRoot() {
  return DEBIAN_ROOT + "rootfs-pack/";
}

function getStateFile() {
  return DEBIAN_ROOT + "state.bin.zst";
}

const kv = new KV();

export async function bootV86(option: VMOption) {
  await kv.loaded;
  const initialStateBuffer = await kv.fetchCachedResource(getStateFile());
  const biosBuffer = await kv.fetchCachedResource(bios);
  const vgabiosBuffer = await kv.fetchCachedResource(vgabios);
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
      buffer: initialStateBuffer
    },
    filesystem: {
      use_pack: {
        prefix_length: 2,
        idb_key: 'server_box_fs',
      },
      baseurl: getFsRoot(),
    },
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
