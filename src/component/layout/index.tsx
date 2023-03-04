import React from "react";
import klass from "classnames";
import Sidebar from "../sidebar";
import Panel from "../panel";
import Monaco from "../monaco";
import Tabs from "../tabs";

import * as styles from "./style.module.less";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <div className={klass(styles.left, styles.activitybar)} />
      <div className={klass(styles.middle, styles.sidebar)}>
        <Sidebar />
      </div>
      <div className={styles.right}>
        <Tabs />
        <div className={styles.monaco}>
          <Monaco />
        </div>
        <Panel />
      </div>
    </div>
  );
}
