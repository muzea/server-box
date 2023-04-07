import React, { useCallback } from "react";
import * as styles from "./style.module.less";
import { useFs } from "../../state/fs";
import FileTree, { FileItem } from "../file-tree";
import { useTabs } from "../../state/tabs";

export default function Sidebar() {
  const handleNewFile = useCallback(() => {}, []);
  const handleNewFolder = useCallback(() => {}, []);
  const handleRefreshFs = useCallback(() => {
    useFs.getState().SyncWith9p();
  }, []);

  const handleSelect = useCallback((node: FileItem) => {
    if (!node.isDirectory) {
      useTabs.getState().add(node.id);
    }
  }, []);

  const fs = useFs();

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
      <div className={styles.fullContentMenu}>
        <FileTree
          list={fs.tree}
          onSelect={handleSelect}
          onNewFile={handleNewFile}
          onNewDirectory={handleNewFolder as any}
        />
      </div>
    </div>
  );
}
