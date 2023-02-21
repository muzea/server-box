export interface V86 {

}



/**
 * Pass an object that has a url. Optionally, `async: true` and `size:
 * size_in_bytes` can be added to the object, so that sectors of the image
 * are loaded on demand instead of being loaded before boot (slower, but
 * strongly recommended for big files). In that case, the `Range: bytes=...`
 * header must be supported on the server.
 */
export interface ImageOption {
    url?: string;
    buffer?: ArrayBuffer | File
    /**
     * download file sectors as requested, size is required
     */
    async?: boolean;
    /**
     * size_in_bytes
     */
    size?: number;
}


export interface VMOption {
    /**
     * The memory size in bytes, should be a power of 2
     * 
     * default `16 * 1024 * 1024`
     */
    memory_size?: number;
    /**
     * VGA memory size in bytes
     * 
     * default `8 * 1024 * 1024`
     */
    vga_memory_size?: number;


    /**
     * Either a url pointing to a bios or an ArrayBuffer
     * 
     * default (No bios)
     */
    bios?: ImageOption;
    /**
     * VGA bios
     * 
     * default (No VGA bios)
     */
    vga_bios?: ImageOption;
    /**
     * default (No CD)
     */
    cdrom?: ImageOption;
    /**
     * First hard disk
     * 
     * default (No hard drive)
     */
    hda?: ImageOption;
    hdb?: ImageOption;
    /**
     * First floppy disk
     * 
     * default (No floppy disk)
     */
    fda?: ImageOption;
    fdb?: ImageOption;

    /**
     * If emulation should be started when emulator is ready
     * 
     * default `false`
     */
    autostart?: boolean;
    /**
     * If the keyboard should be disabled
     * 
     * default `false`
     */
    disable_keyboard?: boolean;
    /**
     * If the mouse should be disabled
     * 
     * default `false`
     */
    disable_mouse?: boolean;
    disable_speaker?: boolean;


    /**
     * A Linux kernel image to boot (only bzimage format)
     */
    bzimage?: ImageOption;
    /**
     * A Linux ramdisk image
     */
    initrd?: ImageOption;
    /**
     * Automatically fetch bzimage and initrd from the specified `filesystem`
     */
    bzimage_initrd_from_filesystem?: boolean
    /**
     * An initial state to load, see [`restore_state`](#restore_statearraybuffer-state) and below
     * 
     * default (Normal boot)
     */
    initial_state?: ImageOption;
    multiboot?: ImageOption;
    /**
     * A 9p filesystem, see [filesystem.md](filesystem.md)
     * 
     * default (No 9p filesystem)
     */
    filesystem?: any

    /**
     * A textarea
     * that will receive and send data to the emulated serial terminal.
     * Alternatively the serial terminal can also be accessed programatically,
     * see [serial.html](../examples/serial.html)
     * 
     * default (No serial terminal)
     */
    serial_container?: HTMLTextAreaElement;
    serial_container_xtermjs?: HTMLElement;
    /**
     * An HTMLElement. This should
     * have a certain structure, see [basic.html](../examples/basic.html)
     * 
     * default (No screen)
     */
    screen_container?: HTMLElement;
    screen_dummy?: any;


    wasm_fn?: (config: { env: any }) => Promise<{
        memory: any
        rust_init: any
    }>

    acpi?: any;
    log_level?: any;
    boot_order?: any;
    fastboot?: any;
    uart1?: any;
    uart2?: any;
    uart3?: any;
    cmdline?: any;
    preserve_mac_from_state_image?: any;
    mac_address_translation?: any;
    cpuid_level?: any;
    network_adapter?: any;
    network_relay_url?: any;
}

export interface Starter {
    bus: { listeners: any; pair: any };
    cpu_is_running: boolean;
    disk_images: {
        fda: any;
        fdb: any;
        hda: any;
        hdb: any;
        cdrom: any;
    };
    emulator_bus: { listeners: any; pair: any; };
    keyboard_adapter: {
        emu_enabled: true;
        bus: any;
        destroy: any;
        init: any;
        simulate_press: any;
    };
    mouse_adapter: {
        enabled: true;
        emu_enabled: true;
        bus: any;
        is_running: true;
        destroy: any;
    };
    screen_adapter: {
        bus: any;
        init: any;
        make_screenshot: any;
        put_char: any;
        timer: any;
    };
    serial_adapter: { element: HTMLElement; term: any; destroy: any };
    speaker_adapter: {
        bus: any;
        audio_context: AudioContext;
        mixer: any;
        pcspeaker: any;
        dac: any;
    };
    v86: {
        running: boolean;
        stopping: boolean;
        tick_counter: number;
        worker: Worker;
        cpu: any;
    };
    /**
     *
     */
    add_listener: (eventName: string, callback: any) => void;
    automatically: Function;
    /**
     * @internal
     */
    continue_init: (emulator: V86, options: VMOption) => void;
    create_file: Function;
    destroy: Function;
    /**
     * @internal
     */
    get_bzimage_initrd_from_filesystem: (fs9p: any) => void;
    get_instruction_counter: Function;
    get_statistics: Function;
    is_running: Function;
    keyboard_send_keys: Function;
    keyboard_send_scancodes: Function;
    keyboard_send_text: Function;
    keyboard_set_status: Function;
    lock_mouse: Function;
    mount_fs: Function;
    mouse_set_status: Function;
    read_file: Function;
    read_memory: Function;
    remove_listener: Function;
    restart: Function;
    restore_state: Function;
    run: Function;
    save_state: Function;
    screen_go_fullscreen: Function;
    screen_make_screenshot: Function;
    screen_set_scale: Function;
    serial0_send: (char: string) => void;
    serial_send_bytes: (serialName: string, data: Uint8Array) => void;
    stop: Function;
    write_memory: Function;
}