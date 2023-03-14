import { create } from "zustand";
// @ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import { getExtWithDot, getName } from "../util/path";
import { getInodePath } from "./fs";
import { StartFileId } from "../const";

export interface TabItem {
  fileName: string;
  filePath: string;
  idx: string;
  languageId: string;
}

export interface TabsState {
  currentIdx: string;
  list: TabItem[];
  add(idx: string): void;
  remove(idx: string): void;
  select(idx: string): void;
}

export const useTabs = create<TabsState>((set, get) => {
  return {
    currentIdx: StartFileId,
    list: [],
    add(idx: string) {
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
          currentIdx: prev.currentIdx === StartFileId ? idx : prev.currentIdx,
          list: nextList,
        };
      });
    },
    remove(idx: string) {
      if (idx !== get().currentIdx) {
        return set({ list: get().list.filter((it) => it.idx !== idx) });
      }
    },
    select(idx: string) {
      const checkIndex = get().list.findIndex((it) => it.idx === idx);
      if (checkIndex >= 0) {
        return set({ currentIdx: get().list[checkIndex].idx });
      }
    },
  };
});
