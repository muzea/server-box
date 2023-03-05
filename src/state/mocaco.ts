import { create } from "zustand";
import { getExtWithDot, getName } from "../util/path";
// @ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import { decodeFromBytes } from "../util/utf8";
import { getInodePath, getGlobalFs } from "./fs";

export interface MocacoState {
  path: string;
  content: string;
  languageId: string;
  idx: number;
  handleFileSelect(idx: number): void;
}

export const useMocacoState = create<MocacoState>((set) => {
  return {
    path: "empty",
    content: "",
    languageId: "",
    idx: -1,
    handleFileSelect(idx: number) {
      const fs = getGlobalFs();
      const inode = fs.GetInode(idx);
      const path = getInodePath(idx);
      fs.Read(idx, 0, inode.size).then((data) => {
        set({
          path: getInodePath(idx),
          content: data ? decodeFromBytes(data) : "",
          languageId: fileIdMap.exts[getExtWithDot(getName(path))],
          idx,
        });
      });
    },
  };
});
