import { create } from "zustand";
import type { DataNode, DirectoryTreeProps } from "antd/es/tree";
import type { FS } from "../vm";
import { ProjectRoot } from "../const";
import { getName } from "../util/path";
import * as styles from "./fs.module.less";

/**
 * fs 状态是同步文件变化来触发 react 更新
 * 不能依赖其他 vm 之外的状态
 */

let fs9p: FS;

export function saveGlobalFs(fs: FS) {
  fs9p = fs;
}

export function getGlobalFs() {
  return fs9p;
}

const fileInfoMap = new Map<number, string>();

export function getInodePath(idx: number) {
  return fileInfoMap.get(idx)!;
}

export interface FsState {
  tree: DataNode[];
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

function buildFileTree(filePath: string): DataNode {
  const nodeInfo = fs9p.SearchPath(filePath);
  fileInfoMap.set(nodeInfo.id, filePath);
  if (fs9p.IsDirectory(nodeInfo.id)) {
    // @ts-ignore
    const result = fs9p.read_dir(ProjectRoot) as string[];
    return {
      title: () => (
        <div className={styles.fsItem}>
          <div>{getName(filePath)}</div>
        </div>
      ),
      key: nodeInfo.id,
      children: result.map((name) => buildFileTree(`${filePath}/${name}`)),
    };
  } else {
    return {
      key: nodeInfo.id,
      title: () => (
        <div className={styles.fsItem}>
          <div>{getName(filePath)}</div>
        </div>
      ),
      isLeaf: true,
    };
  }
}

export const useFs = create<FsState>((set) => {
  return {
    tree: [] as DataNode[],
    SyncWith9p() {
      // TODO 改为订阅目录变化
      set({
        tree: [buildFileTree(ProjectRoot)],
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
      if (typeof idx === "number") {
        // @ts-ignore
        return fs9p.Read(idx);
      }
      if (typeof idx === "string") {
        // @ts-ignore
        return fs9p.read_file(idx) as Promise<Uint8Array>;
      }
      throw new Error("ReadFile 参数错误");
    },
  };
});
