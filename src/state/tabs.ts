import { create } from "zustand";
// @ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import { getExtWithDot, getName } from "../util/path";
import { getInodePath } from "./fs";

export interface TabItem {
  fileName: string;
  filePath: string;
  idx: number;
  languageId: string;
}

export interface TabsState {
  currentIdx: number;
  list: TabItem[];
  add(idx: number): void;
}

export const useTabs = create<TabsState>((set, get) => {
  return {
    currentIdx: -1,
    list: [],
    add(idx: number) {
      const checkIndex = get().list.findIndex((it) => it.idx === idx);
      if (checkIndex >= 0) {
        return set({ currentIdx: get().list[checkIndex].idx });
      }
      const filePath = getInodePath(idx);
      const fileName = getName(filePath);
      const item = {
        fileName: fileName,
        filePath: filePath,
        languageId: fileIdMap.exts[getExtWithDot(fileName)],
        idx,
      };
      set((prev) => {
        const nextList = prev.list.concat(item);
        return {
          currentIdx: prev.currentIdx === -1 ? idx : prev.currentIdx,
          list: nextList,
        };
      });
    },
  };
});