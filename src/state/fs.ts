import { create } from "zustand";
import { TreeNodeInfo } from "@blueprintjs/core";
import { FS } from "../vm"

let fs9p: FS;

const fs = create<{
    tree: TreeNodeInfo[]
}>((set) => {
    return {
        tree: [] as TreeNodeInfo[],
        syncWith9p() {
            // 这里的数据依赖 9p 的事件回调来更新
            fs9p.AddEvent
        }
    }
})