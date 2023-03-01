import { create } from "zustand";
import { Icon, TreeNodeInfo } from "@blueprintjs/core";
import { Tooltip2, Classes as PopClasses } from "@blueprintjs/popover2";
import { FS } from "../vm";
import { ProjectRoot } from "../const";
import { IconNames } from "@blueprintjs/icons";

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

function getName(filePath: string) {
  const list = filePath.split("/");
  return list[list.length - 1];
}

function buildFileTree(filePath: string): TreeNodeInfo {
  const nodeInfo = fs9p.SearchPath(filePath);
  if (fs9p.IsDirectory(nodeInfo.id)) {
    // @ts-ignore
    const result = fs9p.read_dir(ProjectRoot) as string[];
    return {
      childNodes: result.map((name) => buildFileTree(`${filePath}/${name}`)),
      hasCaret: true,
      icon: "folder-open",
      id: nodeInfo.id,
      isExpanded: true,
      label: getName(filePath),
      secondaryLabel: (
        <Tooltip2 className={PopClasses.TOOLTIP2_INDICATOR} content={<span>New File</span>} minimal>
          <Icon icon={IconNames.NewTextBox} />
        </Tooltip2>
      ),
    };
  } else {
    return {
      icon: "document",
      id: nodeInfo.id,
      /**
       * The main label for the node.
       */
      label: getName(filePath),
    };
  }
}

export const useFs = create<FsState>((set) => {
  return {
    tree: [] as TreeNodeInfo[],
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
