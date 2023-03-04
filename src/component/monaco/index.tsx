import React from "react";
import Editor from "@monaco-editor/react";
import loader from "@monaco-editor/loader";
import { useMocacoState } from "../../state/mocaco";
import { useTabs } from "../../state/tabs";
loader.config({ paths: { vs: "https://gw.alipayobjects.com/os/lib/monaco-editor/0.36.1/min/vs" } });

useTabs.subscribe((state) => {
  if (state.currentIdx >= 0) {
    useMocacoState.getState().handleFileSelect(state.currentIdx);
  }
});

export default function Monaco() {
  const state = useMocacoState();
  console.log("state change", state);
  return <Editor theme="vs-dark" defaultLanguage={state.languageId} defaultValue={state.content} path={state.path} />;
}
