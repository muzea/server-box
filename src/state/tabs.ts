import { create } from "zustand";
// @ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import { getExtWithDot, getName } from "../util/path";

export interface TabItem {
  fileName: string;
  filePath: string;
  languageId: string;
}

export interface TabsState {
  currentIndex: number;
  list: TabItem[];
  add(filePath: string): void;
}

export const useTabs = create<TabsState>((set) => {
  return {
    currentIndex: -1,
    list: [],
    add(filePath: string) {
      const fileName = getName(filePath);
      const item = {
        fileName: fileName,
        filePath: filePath,
        languageId: fileIdMap.exts[getExtWithDot(fileName)],
      };
      set((prev) => {
        const nextList = prev.list.concat(item);
        return {
          currentIndex: prev.currentIndex === -1 ? 0 : prev.currentIndex,
          list: nextList,
        };
      });
    },
  };
});
