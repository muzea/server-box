import { create } from "zustand";
import type { DataNode, DirectoryTreeProps } from "antd/es/tree";
import type { FS } from "../vm";
import { ProjectRoot } from "../const";
import { getName } from "../util/path";
import * as styles from "./fs.module.less";
import fs9p from "../fs";

/**
 * fs 状态是同步文件变化来触发 react 更新
 * 不能依赖其他 vm 之外的状态
 */

const fileInfoMap = new Map<string, string>();

export interface FsState {
  tree: DataNode[];
  SyncWith9p(): void;
}

async function buildFileTree(filePath: string): Promise<DataNode> {
  const fsp = fs9p.fsp;
  const nodeInfo = await fsp.stat(filePath);
  // filer https://github.com/filerjs/filer/blob/HEAD/src/stats.js#L12-L13
  // stats don't has ino prop
  // @ts-expect-error
  fileInfoMap.set(nodeInfo.node, filePath);
  if (nodeInfo.isDirectory()) {
    // @ts-ignore
    const result = await fsp.readdir(ProjectRoot);

    const children: DataNode[] = [];
    for (const name of result) {
      children.push(await buildFileTree(`${filePath}/${name}`));
    }
    return {
      title: () => (
        <div className={styles.fsItem}>
          {/* @ts-expect-error */}
          <div>{nodeInfo.name}</div>
        </div>
      ),
      // @ts-expect-error
      key: nodeInfo.node,
      children,
    };
  } else {
    return {
      // @ts-expect-error
      key: nodeInfo.node,
      title: () => (
        <div className={styles.fsItem}>
          {/* @ts-expect-error */}
          <div>{nodeInfo.name}</div>
        </div>
      ),
      isLeaf: true,
    };
  }
}

export function getInodePath(idx: string) {
  return fileInfoMap.get(idx)!;
}

export async function readFile(idx: string): Promise<ArrayBuffer> {
  return await fs9p.fsp.readFile(fileInfoMap.get(idx)!);
}

export async function writeFile(idx: string, data: string | ArrayBuffer): Promise<void> {
  return await fs9p.fsp.writeFile(fileInfoMap.get(idx)!, data as any);
}

export async function createFile(path: string, name: string, data: string | ArrayBuffer): Promise<void> {
  return await fs9p.fsp.writeFile(fs9p.Path.join(path, name), data as any);
}

export const useFs = create<FsState>((set) => {
  return {
    tree: [] as DataNode[],
    SyncWith9p() {
      // TODO 改为订阅目录变化
      buildFileTree(ProjectRoot).then((list) => {
        set({
          tree: [list],
        });
      });
    },
  };
});
