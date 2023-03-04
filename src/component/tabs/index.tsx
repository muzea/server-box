import * as React from "react";
import klass from "classnames";
//@ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import { TabItem, useTabs } from "../../state/tabs";
import styles from "./style.module.less";

function Item(props: { item: TabItem }) {
  const mapId = fileIdMap.languageIds[props.item.languageId];
  const info = fileIdMap.iconDefinitions[mapId];
  return (
    <div className={styles.item}>
      <div className={klass(styles.icon, "seti-icon")} style={{ color: info.fontColor }}>
        {String.fromCharCode(parseInt(info.fontCharacter.replace("\\", ""), 16))}
      </div>
      <div>{props.item.fileName}</div>
      <div className={styles.close}>
        <span>x</span>
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
        <Item item={it} />
      ))}
    </div>
  );
}
