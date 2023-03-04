import React, { useCallback } from "react";
import klass from "classnames";
import { Tree, TreeProps } from "antd";

import * as styles from "./style.module.less";
import { useFs, getInodePath } from "../../state/fs";
import { useMocacoState } from "../../state/mocaco";
import FileTreeContextMenu from "../file-tree-context-menu";
import { useTabs } from "../../state/tabs";

const { DirectoryTree } = Tree;

function FileTree() {
  const fs = useFs();
  const handleSelect = useCallback<NonNullable<TreeProps["onSelect"]>>((keys, info) => {
    if (info.node.isLeaf) {
      useTabs.getState().add(getInodePath(info.node.key as number));
      useMocacoState.getState().handleFileSelect(info.node.key as number);
    }
  }, []);

  return <DirectoryTree defaultExpandAll treeData={fs.tree} onSelect={handleSelect} />;
}

export default function Sidebar() {
  const handleNewFile = useCallback(() => {}, []);
  const handleNewFolder = useCallback(() => {}, []);
  return (
    <div className={styles.sidebar}>
      <div className={styles.paneHeader}>server-box</div>
      <FileTreeContextMenu className={styles.fullContentMenu} onNewFile={handleNewFile} onNewFolder={handleNewFolder}>
        <FileTree />
      </FileTreeContextMenu>
    </div>
  );
}
