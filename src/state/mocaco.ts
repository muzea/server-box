import { create } from "zustand";
import { decodeFromBytes } from "../util/utf8";
import { getInodePath, getGlobalFs } from "./fs";

export interface MocacoState {
  currentIdx: number;
  path: string;
  content: string;
  handleFileSelect(idx: number): void;
}

export const useMocacoState = create<MocacoState>((set) => {
  return {
    currentIdx: -1,
    path: "empty",
    content: "",
    handleFileSelect(idx: number) {
      const fs = getGlobalFs();
      const inode = fs.GetInode(idx);
      fs.Read(idx, 0, inode.size).then((data) => {
        set({
          currentIdx: idx,
          path: getInodePath(idx),
          content: decodeFromBytes(data),
        });
      });
    },
  };
});
