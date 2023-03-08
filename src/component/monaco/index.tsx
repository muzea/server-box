import React, { useCallback, useEffect, useRef } from "react";
import type * as MonacoNS from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import loader from "@monaco-editor/loader";
import { useTabs } from "../../state/tabs";
import * as styles from "./style.module.less";
import { getGlobalFs, getInodePath } from "../../state/fs";
import { getExtWithDot, getName } from "../../util/path";
import { decodeFromBytes, encodeToBytes } from "../../util/utf8";

loader.config({ paths: { vs: "https://gw.alipayobjects.com/os/lib/monaco-editor/0.36.1/min/vs" } });

type MonacoType = typeof MonacoNS;

function getModel(monaco: MonacoType, value: string, language: string, path: string) {
  const uri = monaco.Uri.parse(path);
  const prev = monaco.editor.getModel(uri);
  return prev || monaco.editor.createModel(value, language, uri);
}

const Readme = `致力于提供一个可交互的在线 Linux VM
`;

export default function Monaco() {
  const monacoRef = useRef<MonacoType>();
  const editorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor>();

  const handleDomMount = useCallback((dom: HTMLDivElement) => {
    loader.init().then((monaco: MonacoType) => {
      monacoRef.current = monaco;
      const defalutModel = getModel(monaco, Readme, "markdown", "Readme.md");
      const editor = monaco.editor.create(dom, {
        model: defalutModel,
        theme: "vs-dark",
      });

      editorRef.current = editor;

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
        const model = editor.getModel();
        if (model && model !== defalutModel) {
          const idx = model.uri.path.substring(1);
          const buffer = encodeToBytes(model.getValue());
          getGlobalFs().Write(parseInt(idx, 10), 0, buffer.length, buffer);
        }
      });
    });
  }, []);

  useEffect(() => {
    return useTabs.subscribe((state) => {
      const monaco = monacoRef.current;
      if (!monaco) {
        console.error("tabs change but editor not ready");
        return;
      }
      if (state.currentIdx >= 0) {
        console.log("handleFileSelect", state.currentIdx);

        const uri = monaco.Uri.parse(String(state.currentIdx));
        const prev = monaco.editor.getModel(uri);

        if (prev) {
          editorRef.current?.setModel(prev);
          return;
        }
        const fs = getGlobalFs();
        const inode = fs.GetInode(state.currentIdx);
        const path = getInodePath(state.currentIdx);
        fs.Read(state.currentIdx, 0, inode.size).then((data) => {
          const model = getModel(
            monaco,
            data ? decodeFromBytes(data) : "",
            fileIdMap.exts[getExtWithDot(getName(path))],
            String(state.currentIdx)
          );

          editorRef.current?.setModel(model);
        });
      }
    });
  }, []);

  return <div className={styles.editor} ref={handleDomMount} />;
}
