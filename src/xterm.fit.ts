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

export class FitAddon {
    private _terminal: any;

    constructor() { }

    public activate(terminal: any): void {
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

    public proposeDimensions(): any | undefined {
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