import React from "react";
import klass from "classnames";
import Editor from "@monaco-editor/react";
import loader from "@monaco-editor/loader";

loader.config({ paths: { vs: "https://gw.alipayobjects.com/os/lib/monaco-editor/0.36.1/min/vs" } });

import * as styles from "./style.module.less";
import { useMocacoState } from "../../state/mocaco";

export default function Monaco() {
  const state = useMocacoState();
  console.log("state change", state);
  return <Editor theme="vs-dark" defaultLanguage="javascript" defaultValue={state.content} path={state.path} />;
}
