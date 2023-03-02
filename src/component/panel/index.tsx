import React from "react";
import klass from "classnames";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import * as styles from "./style.module.less";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: `Terminal`,
  },
  {
    key: "2",
    label: `Tab 2`,
  },
  {
    key: "3",
    label: `Tab 3`,
  },
];

export default function Panel() {
  return (
    <div className={styles.panel}>
      <div className={styles.switcher}>
        <Tabs defaultActiveKey="1" items={items} animated={false} size="small" />
      </div>
      <div id="terminal" />
    </div>
  );
}
