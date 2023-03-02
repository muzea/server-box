import { KVSIndexedDB, kvsIndexedDB } from "@kvs/indexeddb";

type StorageSchema = {
    [k in string]: ArrayBuffer;
};


export class KV {
    // @ts-ignore
    idb: KVSIndexedDB<StorageSchema>
    loaded: Promise<void>
    constructor() {
        this.loaded = kvsIndexedDB<StorageSchema>({
            name: "server_box",
            version: 1,
        }).then(idb => {
            this.idb = idb;
        });
    }
    async fetchCachedResource(url: string) {
        if (!await this.idb.has(url)) {
            const resp = await (await fetch(url)).arrayBuffer();
            await this.idb.set(url, resp);
            return resp;
        }
        const result = await this.idb.get(url);
        return result;
    }
}
