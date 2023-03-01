import { create } from "zustand";
import { TreeNodeInfo } from "@blueprintjs/core";
import { FS } from "../vm"
import { ProjectRoot } from "../const";

let fs9p: FS;

export function saveGlobalFs(fs: FS) {
    fs9p = fs;
}

export interface FsState {
    tree: TreeNodeInfo[];
    SyncWith9p(): void;
    /**
     * 获取指定文件/目录的 idx
     */
    GetIdx(name: string): number;
    CreateFile(name: string, pid: number): number;
    CreateDirectory(name: string, pid: number): number;
    ReadFile(idx: number): Promise<Uint8Array>;
    ReadFile(name: string): Promise<Uint8Array>;
}

function buildFileTree(dir: string): TreeNodeInfo {
    const nodeInfo = fs9p.SearchPath(dir);

    if (fs9p.IsDirectory(nodeInfo.id)) {
        // @ts-ignore
        const result = fs9p.read_dir(ProjectRoot) as string[];
        return {
            childNodes: result.map(name => buildFileTree(`${dir}/${name}`)),
            hasCaret: true,
            icon: 'folder-open',
            id: nodeInfo.id,
            isExpanded: true,
            label: nodeInfo.name,
        };
    } else {
        return {
            icon: 'document',
            id: nodeInfo.id,
            /**
             * The main label for the node.
             */
            label: nodeInfo.name,
        };
    }

    // @ts-ignore
    const result = fs9p.read_dir(ProjectRoot);
    console.log('fs dir', result);

}

export const useFs = create<FsState>((set) => {
    return {
        tree: [] as TreeNodeInfo[],
        SyncWith9p() {
            // TODO 改为订阅目录变化
            set({
                tree: [buildFileTree(ProjectRoot)]
            });
        },
        /**
         * 获取指定文件/目录的 idx
         */
        GetIdx(name: string) {
            return fs9p.SearchPath(name).id;
        },
        CreateFile(name: string, pid: number) {
            return fs9p.CreateFile(name, pid);
        },
        CreateDirectory(name: string, pid: number) {
            return fs9p.CreateDirectory(name, pid);
        },
        ReadFile(idx: any) {
            if (typeof idx === 'number') {
                // @ts-ignore
                return fs9p.Read(idx);
            }
            if (typeof idx === 'string') {
                // @ts-ignore
                return fs9p.read_file(idx) as Promise<Uint8Array>;
            }
            throw new Error('ReadFile 参数错误');
        },
    }
})