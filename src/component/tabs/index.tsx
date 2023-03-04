import * as React from "react";
import klass from "classnames";
//@ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import { TabItem, useTabs } from "../../state/tabs";
import styles from "./style.module.less";

function Item(props: { item: TabItem; curent: boolean }) {
  const { item, curent } = props;
  const mapId = fileIdMap.languageIds[item.languageId];
  const info = fileIdMap.iconDefinitions[mapId];

  const handleTabClick = React.useCallback(() => {
    console.log("handleTabClick", item);
  }, []);
  const handleCloseClick = React.useCallback<React.MouseEventHandler<HTMLDivElement>>((e) => {
    e.stopPropagation();
    console.log("handleCloseClick", item);
  }, []);
  return (
    <div className={klass(styles.item, curent && styles.curent)} onClick={handleTabClick}>
      <div className={klass(styles.icon, "seti-icon")} style={{ color: info.fontColor }}>
        {String.fromCharCode(parseInt(info.fontCharacter.replace("\\", ""), 16))}
      </div>
      <div>{item.fileName}</div>
      <div className={styles.close} onClick={handleCloseClick}>
        <a className="action-label codicon codicon-close" role="button" />
      </div>
    </div>
  );
}

export default function Tabs() {
  const handleNewFile = () => {
    console.log("handleNewFile");
  };
  const handleNewFolder = () => {
    console.log("handleNewFolder");
  };

  const tabsState = useTabs();

  return (
    <div className={styles.tabs}>
      {tabsState.list.map((it) => (
        <Item key={it.filePath} curent={tabsState.currentIdx === it.idx} item={it} />
      ))}
    </div>
  );
}
