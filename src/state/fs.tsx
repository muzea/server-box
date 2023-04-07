import { create } from "zustand";
import type { FileItem } from "../component/file-tree";
import { ProjectRoot } from "../const";
import fs9p from "../v86-extend/fs";
import { debounce } from "../util/fn";

/**
 * fs can only depend on filer, not other states
 */

const fileInfoMap = new Map<string, string>();

export interface FsState {
  tree: FileItem[];
  SyncWith9p(): void;
}

async function buildFileTree(filePath: string): Promise<FileItem> {
  const fsp = fs9p.fsp;
  const nodeInfo = await fsp.stat(filePath);
  // filer https://github.com/filerjs/filer/blob/HEAD/src/stats.js#L12-L13
  // stats don't has ino prop
  // @ts-expect-error
  fileInfoMap.set(nodeInfo.node, filePath);
  if (nodeInfo.isDirectory()) {
    // @ts-ignore
    const result = await fsp.readdir(filePath);

    const children: FileItem[] = [];
    for (const name of result) {
      children.push(await buildFileTree(`${filePath}/${name}`));
    }
    return {
      // @ts-expect-error
      id: nodeInfo.node,
      // @ts-expect-error
      fileName: nodeInfo.name,
      isDirectory: true,
      children,
    };
  } else {
    return {
      // @ts-expect-error
      id: nodeInfo.node,
      // @ts-expect-error
      fileName: nodeInfo.name,
      isDirectory: false,
    };
  }
}

export function getInodePath(idx: string) {
  return fileInfoMap.get(idx)!;
}

export async function readFile(idx: string): Promise<ArrayBuffer> {
  return await fs9p.fsp.readFile(fileInfoMap.get(idx)!);
}

export async function writeFile(idx: string, data: ArrayBuffer): Promise<void> {
  return await fs9p.fsp.writeFile(fileInfoMap.get(idx)!, new fs9p.Buffer(data));
}

export async function createFile(path: string, name: string, data: ArrayBuffer): Promise<void> {
  return await fs9p.fsp.writeFile(fs9p.Path.join(path, name), new fs9p.Buffer(data));
}

export const useFs = create<FsState>((set) => {
  return {
    tree: [] as FileItem[],
    SyncWith9p() {
      const fn = debounce(() => {
        buildFileTree(ProjectRoot).then((list) => {
          list.fileName = "/mnt";
          set({
            tree: [list],
          });
        });
      });

      fn();

      fs9p.fs.watch(ProjectRoot, { recursive: true }, fn);
    },
  };
});
