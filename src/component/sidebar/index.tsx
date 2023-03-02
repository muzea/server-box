import React, { useCallback } from "react";
import klass from "classnames";
import { Tree, TreeProps } from "antd";

import * as styles from "./style.module.less";
import { useFs } from "../../state/fs";
import { useMocacoState } from "../../state/mocaco";

const { DirectoryTree } = Tree;

export default function Sidebar() {
  const fs = useFs();
  const handleSelect = useCallback<NonNullable<TreeProps["onSelect"]>>((keys, info) => {
    if (info.node.isLeaf) {
      useMocacoState.getState().handleFileSelect(info.node.key as number);
    }
  }, []);
  return (
    <div className={styles.sidebar}>
      <DirectoryTree defaultExpandAll treeData={fs.tree} onSelect={handleSelect} />
    </div>
  );
}
