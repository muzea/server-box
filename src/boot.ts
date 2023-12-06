// @ts-nocheck
// import { VMOption, V86Starter } from "@woodenfish/libv86/build/libv86-debug";
import { VMOption, V86Starter } from "@woodenfish/libv86";
import v86Wasm from "@woodenfish/libv86/build/v86.wasm?url";
import bios from "@woodenfish/libv86/bios/seabios.bin?url";
import vgabios from "@woodenfish/libv86/bios/vgabios.bin?url";

import qs from "qs";
import { fetchArrayBuffer, fetchJson } from "./util/cache";
import fs9p from "./v86-extend/fs";
import { SerialAdapterXtermJS } from "./v86-extend/xterm";
import NetworkAdapter from "./v86-extend/network";

const CDN_ROOT = "https://server-box-r2.muyu.dev/";
// const Local = "/temp_fs/debian-10-slim/";
const Local = "/temp_fs/";

const query = qs.parse(window.location.search.slice(1));
const isLocal = query.local && true;

const DEBIAN_ROOT = isLocal ? Local : CDN_ROOT;

function getHddFile() {
  return DEBIAN_ROOT + (query.hdd || "linux.img");
}

function getStateFile() {
  return DEBIAN_ROOT + (query.state || "state.bin.zst");
}

export async function bootV86(option: VMOption) {
  const biosBuffer = await fetchArrayBuffer(bios);
  const vgabiosBuffer = await fetchArrayBuffer(vgabios);

  const payload = {
    bios: { buffer: biosBuffer },
    vga_bios: { buffer: vgabiosBuffer },
    wasm_path: v86Wasm,
    vga_memory_size: 8 * 1024 * 1024,
    memory_size: 512 * 1024 * 1024,
    // initial_state: {
    //   buffer: initialStateBuffer,
    // },
    // hda: {
    //   buffer: debianBuffer,
    // },
    filesystem: fs9p,
    autostart: true,
    // Mouse disabled, undo if you want to interact with the screen
    disable_mouse: true,
    // Keyboard disabled, undo if you want to type in screen
    disable_keyboard: true,
    // Disable sound
    disable_speaker: true,
    network_adapter: NetworkAdapter,
    ...option,
  };

  if (query.disableState) {
    const debianBuffer = await fetchArrayBuffer(getHddFile());
    payload.hda = {
      buffer: debianBuffer,
    };
  } else {
    const initialStateBuffer = await fetchArrayBuffer(getStateFile());
    payload.hda = {
      buffer: new ArrayBuffer(42),
    };
    payload.initial_state = {
      buffer: initialStateBuffer,
    };
  }

  const emulator = new V86Starter(payload);

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

  emulator.add_listener("emulator-ready", async function () {
    console.log("boot linux at ", performance.now());
  });

  return emulator;
}
