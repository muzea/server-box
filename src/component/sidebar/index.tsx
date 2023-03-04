import React, { useCallback } from "react";
import { Tree, TreeProps } from "antd";
import * as styles from "./style.module.less";
import { useFs } from "../../state/fs";
import FileTreeContextMenu from "../file-tree-context-menu";
import { useTabs } from "../../state/tabs";

const { DirectoryTree } = Tree;

function FileTree() {
  const fs = useFs();
  const handleSelect = useCallback<NonNullable<TreeProps["onSelect"]>>((keys, info) => {
    if (info.node.isLeaf) {
      useTabs.getState().add(info.node.key as number);
    }
  }, []);

  return <DirectoryTree defaultExpandAll treeData={fs.tree} onSelect={handleSelect} />;
}

export default function Sidebar() {
  const handleNewFile = useCallback(() => {}, []);
  const handleNewFolder = useCallback(() => {}, []);
  const handleRefreshFs = useCallback(() => {
    useFs.getState().SyncWith9p();
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.paneHeader}>
        <div>server-box</div>
        <div className={styles.actions}>
          <div className={styles.action} onClick={handleRefreshFs}>
            <a className="action-label codicon codicon-refresh" role="button" />
          </div>
        </div>
      </div>
      <FileTreeContextMenu className={styles.fullContentMenu} onNewFile={handleNewFile} onNewFolder={handleNewFolder}>
        <FileTree />
      </FileTreeContextMenu>
    </div>
  );
}
