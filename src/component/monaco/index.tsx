import React, { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import loader from "@monaco-editor/loader";
import { useMocacoState } from "../../state/mocaco";
import { useTabs } from "../../state/tabs";
loader.config({ paths: { vs: "https://gw.alipayobjects.com/os/lib/monaco-editor/0.36.1/min/vs" } });

useTabs.subscribe((state) => {
  if (state.currentIdx >= 0) {
    console.log("handleFileSelect", state.currentIdx);
    useMocacoState.getState().handleFileSelect(state.currentIdx);
  }
});

export default function Monaco() {
  const state = useMocacoState();
  console.log("state change", state);

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      console.log("here is the monaco instance:", monaco);

      monaco.editor.addEditorAction({
        id: "server-box-save-file",
        label: "save file",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        run: function () {
          alert("save-file");
        },
      });
    }
  }, [monaco]);

  return <Editor theme="vs-dark" defaultLanguage={state.languageId} defaultValue={state.content} path={state.path} />;
}
