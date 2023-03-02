import React from "react";
import klass from "classnames";
import Sidebar from "../sidebar";
import Panel from "../panel";

import * as styles from "./style.module.less";
import Monaco from "../monaco";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <div className={klass(styles.left, styles.activitybar)} />
      <div className={klass(styles.middle, styles.sidebar)}>
        <Sidebar />
      </div>
      <div className={styles.right}>
        <div className={styles.tabs}>tabs</div>
        <div className={styles.monaco}>
          <Monaco />
        </div>
        <div className={styles.panel}>
          <Panel />
        </div>
      </div>
    </div>
  );
}
