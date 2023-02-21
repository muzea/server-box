// @ts-nocheck
import { V86Starter } from "v86";
import v86Wasm from "v86/build/v86.wasm?init";
import bios from "v86/bios/seabios.bin?url";
import vgabios from "v86/bios/vgabios.bin?url";
import cdrom from "../images/alpine/virt-3.17.2/alpine-virt-3.17.2-x86.iso?url";
import state from "../images/alpine/virt-3.17.2/v86state.bin?url";
import "./lib/log";
import { Emulator, VMOption } from "./vm";

window.DEBUG = true;

const MINIMUM_COLS = 2;
const MINIMUM_ROWS = 1;

interface IRenderDimensions {
  actualCellHeight: number;
  actualCellWidth: number;
  canvasHeight: number;
  canvasWidth: number;
  scaledCanvasHeight: number;
  scaledCanvasWidth: number;
  scaledCellHeight: number;
  scaledCellWidth: number;
  scaledCharHeight: number;
  scaledCharLeft: number;
  scaledCharTop: number;
  scaledCharWidth: number;
}

class FitAddon {
  private _terminal: Terminal | undefined;

  constructor() { }

  public activate(terminal: Terminal): void {
    this._terminal = terminal;
  }

  public dispose(): void { }

  public fit(): void {
    const dims = this.proposeDimensions();
    if (!dims || !this._terminal || isNaN(dims.cols) || isNaN(dims.rows)) {
      return;
    }

    // TODO: Remove reliance on private API
    const core = (this._terminal as any)._core;

    // Force a full render
    if (
      this._terminal.rows !== dims.rows ||
      this._terminal.cols !== dims.cols
    ) {
      core._renderService.clear();
      this._terminal.resize(dims.cols, dims.rows);
    }
  }

  public proposeDimensions(): ITerminalDimensions | undefined {
    if (!this._terminal) {
      return undefined;
    }

    if (!this._terminal.element || !this._terminal.element.parentElement) {
      return undefined;
    }

    // TODO: Remove reliance on private API
    const core = (this._terminal as any)._core;
    const dims: IRenderDimensions = core._renderService.dimensions;

    if (dims.actualCellWidth === 0 || dims.actualCellHeight === 0) {
      return undefined;
    }

    const scrollbarWidth =
      this._terminal.options.scrollback === 0
        ? 0
        : core.viewport.scrollBarWidth;

    const parentElementStyle = window.getComputedStyle(
      this._terminal.element.parentElement
    );
    const parentElementHeight = parseInt(
      parentElementStyle.getPropertyValue("height")
    );
    const parentElementWidth = Math.max(
      0,
      parseInt(parentElementStyle.getPropertyValue("width"))
    );
    const elementStyle = window.getComputedStyle(this._terminal.element);
    const elementPadding = {
      top: parseInt(elementStyle.getPropertyValue("padding-top")),
      bottom: parseInt(elementStyle.getPropertyValue("padding-bottom")),
      right: parseInt(elementStyle.getPropertyValue("padding-right")),
      left: parseInt(elementStyle.getPropertyValue("padding-left")),
    };
    const elementPaddingVer = elementPadding.top + elementPadding.bottom;
    const elementPaddingHor = elementPadding.right + elementPadding.left;
    const availableHeight = parentElementHeight - elementPaddingVer;
    const availableWidth =
      parentElementWidth - elementPaddingHor - scrollbarWidth;
    const geometry = {
      cols: Math.max(
        MINIMUM_COLS,
        Math.floor(availableWidth / dims.actualCellWidth)
      ),
      rows: Math.max(
        MINIMUM_ROWS,
        Math.floor(availableHeight / dims.actualCellHeight)
      ),
    };

    return geometry;
  }
}

function wrapWasm(options) {
  return v86Wasm(options).then((instance) => instance.exports);
}

export function bootV86(option: VMOption) {
  const emulator: Emulator = new V86Starter({
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
