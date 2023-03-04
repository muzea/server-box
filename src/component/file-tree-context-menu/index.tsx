import * as React from "react";
import klass from "classnames";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as styles from "./style.module.less";

interface Props {
  className?: string;
  onNewFile(): void;
  onNewFolder(): void;
}

export default function FileTreeContextMenu(props: React.PropsWithChildren<Props>) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className={klass(styles.ContextMenuTrigger, props.className)}>
        {props.children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.ContextMenuContent}>
          <ContextMenu.Item onSelect={props.onNewFile} className={styles.ContextMenuItem}>
            New File...
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={props.onNewFolder} className={styles.ContextMenuItem}>
            New Folder...
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
