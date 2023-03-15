export interface V86 {

}

export interface AbstractFileStorage {
    /**
     * Read a portion of a file.
     * null if file does not exist.
     */
    read(sha256sum: string, offset: number, count: number): Promise<Uint8Array>;

    /**
     * Add a read-only file to the filestorage.
     */
    cache(sha256sum: string, data: Uint8Array): Promise<any>;

    /**
     * Call this when the file won't be used soon, e.g. when a file closes or when this immutable
     * version is already out of date. It is used to help prevent accumulation of unused files in
     * memory in the long run for some FileStorage mediums.
     */
    uncache(sha256sum: string): void
}

export interface Qidcounter {
    last_qidnumber: number
}

export declare class FS {
    /**
     *
     * @param fileStorageInstance
     * @param qidcounter  Another fs's qidcounter to synchronise with.
     */
    constructor(fileStorageInstance: AbstractFileStorage, qidcounter: Qidcounter);
    // FIX_ME
    private get_state(): void
    // FIX_ME
    private set_state(): void
    AddEvent(id: number, OnEvent: () => void): void
    HandleEvent(id: number): void
    // FIX_ME
    private load_from_json(): void
    LoadRecursive(data: any[], parentid: number): void
    LoadDir(parentid: number, children: any[][]): void
    // FIX_ME
    private should_be_linked(): void
    // FIX_ME
    private link_under_dir(): void
    // FIX_ME
    private unlink_from_dir(): void
    PushInode(inode: Inode, parentid: number, name: string): void
    // FIX_ME
    private divert(): void
    // FIX_ME
    private copy_inode(): void

    CreateInode(): Inode
    /**
     * Note: parentid = -1 for initial root directory.
     * @returns idx
     */
    CreateDirectory(name: string, parentid: number): number;
    /**
     * @returns idx
     */
    CreateFile(filename: string, parentid: number): number;
    /**
     * @returns idx
     */
    CreateNode(filename: string, parentid: number, major: number, minor: number): void;
    /**
     * @returns idx
     */
    CreateSymlink(filename: string, parentid: number, symlink: string): number;
    /**
     * @returns idx
     */
    CreateTextFile(filename: string, parentid: number, str: string): number;
    /**
     * @returns idx
     */
    CreateBinaryFile(filename: string, parentid: number, buffer: Uint8Array): Promise<number>;

    OpenInode(id: number, mode: number): void;
    CloseInode(id: number): Promise<void>;

    /**
     * @returns 0 if success, or -errno if failured.
     */
    Rename(olddirid: number, oldname: string, newdirid: number, newname: string): Promise<number>;
    Write(id: number, offset: number, count: number, buffer: Uint8Array): Promise<void>;
    Read(inodeid: number, offset: number, count: number): Promise<Uint8Array>;
    /**
     * @returns idx
     */
    Search(parentid: number, name: string): void;

    CountUsedInodes(): number;
    CountFreeInodes(): number;
    GetTotalSize(): number;
    /**
     * FIX_SOURCE
     */
    GetSpace(): number;

    GetDirectoryName(idx: number): string;
    GetFullPath(idx: number): string;

    /**
     * @returns 0 if success, or -errno if failured.
     */
    Link(parentid: number, targetid: number, name: string): number;
    /**
     * @returns 0 if success, or -errno if failured.
     */
    Unlink(parentid: number, name: string): number;

    DeleteData(idx: number): Promise<void>;
    // FIX_ME
    private get_buffer(): void;
    // FIX_ME
    private get_data(): void;
    // FIX_ME
    private set_data(): void;

    GetInode(idx: number): Inode;
    ChangeSize(idx: number, newsize: number): Promise<void>;
    SearchPath(path: string): {
        id: number;
        parentid: number;
        name: string;
        forward_path: string | null;
    };
    /**
     *
     * @param dirid
     * @param list is a ref list, contain the result
     */
    GetRecursiveList(dirid: number, list: { parentid: number, name: string }[]): void;
    RecursiveDelete(path: string): void;
    DeleteNode(path: string): void;
    /**
     * FIX_SOURCE
     * @deprecated
     */
    NotifyListeners(id: number, action: string, info: any): void;
    Check(): void;
    FillDirectory(dirid: number): void;
    RoundToDirentry(dirid: number, offset_target: number): number;
    IsDirectory(idx: number): boolean;
    IsEmpty(idx: number): boolean;
    GetChildren(idx: number): string[];
    GetParent(idx: number): number;

    /**
     *  only support for security.capabilities
     *  should return a  "struct vfs_cap_data" defined in
     *  linux/capability for format
     *  check also:
     *    sys/capability.h
     *    http://lxr.free-electrons.com/source/security/commoncap.c#L376
     *    http://man7.org/linux/man-pages/man7/capabilities.7.html
     *    http://man7.org/linux/man-pages/man8/getcap.8.html
     *    http://man7.org/linux/man-pages/man3/libcap.3.html
     */
    PrepareCAPs(id: number): number;

    // FIX_ME
    private set_forwarder(): void;
    // FIX_ME
    private create_forwarder(): void;
    // FIX_ME
    private is_forwarder(): void;
    // FIX_ME
    private is_a_root(): void;
    // FIX_ME
    private get_forwarder(): void;
    // FIX_ME
    private delete_forwarder(): void;
    // FIX_ME
    private follow_fs(): void;

    /**
     * Mount another filesystem to given path.
     * @returns inode id of mount point if successful, or -errno if mounting failed.
     */
    Mount(path: string, fs: FS): number;
    DescribeLock(type: number, start: number, length: number, proc_id: number, client_id: string): FSLockRegion;
    /**
     * @return The first conflicting lock found, or null if requested lock is possible.
     */
    GetLockn(id: number, request: FSLockRegion): FSLockRegion | null;


    /**
     * @return One of P9_LOCK_SUCCESS / P9_LOCK_BLOCKED / P9_LOCK_ERROR / P9_LOCK_GRACE.
     */
    Lockn(id: number, request: FSLockRegion, flags: number): number;


    private read_dir(path: string): undefined | any[];
    private read_file(file: string): Promise<Uint8Array | null>
}

export declare class FSLockRegion {
    constructor();
    type: number;
    start: number;
    length: number;
    proc_id: number;
    client_id: string;

    get_state(): [number, number, number, number, string];
    set_state(state: [number, number, number, number, string]): void;
    clone(): FSLockRegion;
    conflicts_with(region: FSLockRegion): boolean;
    is_alike(region: FSLockRegion): boolean;
    may_merge_after(region: FSLockRegion): boolean;
}

export declare class FSMountInfo {
    fs: FS;
    backtrack: Map<number, number>;
    constructor(fs: FS);

    get_state(): void;
    set_state(): void;
}

export declare class Inode {
    /**
     *  maps filename to inode id
     */
    direntries: Map<any, any>;
    status: number;
    size: number;
    uid: number;
    gid: number;
    fid: number;
    ctime: number;
    atime: number;
    mtime: number;
    major: number;
    minor: number;
    symlink: string;
    mode: number;
    qid: {
        type: number;
        version: number;
        path: number;
    };
    caps: any;
    nlinks: number;
    sha256sum: string;

    /**
     * lock regions applied to the file, sorted by starting offset.
     */
    locks: FSLockRegion[];

    /**
     * For forwarders:
     * which fs in this.mounts does this inode forward to?
     */
    mount_id: number;
    /**
     * which foreign inode id does it represent?
     */
    foreign_id: number;

    get_state(): any[];
    set_state(state: any[]): void;
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

export declare class Starter {
    constructor(option: VMOption);
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
    add_listener(eventName: string, callback: any): void;
    automatically: Function;
    /**
     * @internal
     */
    continue_init(emulator: V86, options: VMOption): void;
    destroy: Function;
    /**
     * @internal
     */
    get_bzimage_initrd_from_filesystem(fs9p: FS): void;
    get_instruction_counter: Function;
    get_statistics: Function;
    is_running: Function;
    keyboard_send_keys: Function;
    keyboard_send_scancodes: Function;
    keyboard_send_text: Function;
    keyboard_set_status: Function;
    lock_mouse: Function;
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
    serial0_send(char: string): void;
    serial_send_bytes(serialName: string, data: Uint8Array): void;
    stop: Function;
    write_memory: Function;

    /**
     * must set filesystem `true`
     */
    fs9p?: FS;
    /**
     * Mount another filesystem to the current filesystem.
     * @param path Path for the mount point
     * @param baseurl
     * @param basefs As a JSON string
     * @param callback
     */
    mount_fs(path: string, baseurl?: string, basefs?: string, callback?: Function): void;
    /**
     * Write to a file in the 9p filesystem. Nothing happens if no filesystem has
     * been initialized.
     */
    create_file(file: string, data: Uint8Array): Promise<void>;
}
