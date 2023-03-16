import React, { useCallback, useEffect, useRef } from "react";
import type * as MonacoNS from "monaco-editor/esm/vs/editor/editor.api";
// @ts-ignore
import fileIdMap from "@woodenfish/vscode-icon-map-seti";
import loader from "@monaco-editor/loader";
import { useTabs } from "../../state/tabs";
import * as styles from "./style.module.less";
import { getInodePath, readFile, writeFile } from "../../state/fs";
import { getExtWithDot, getName } from "../../util/path";
import { decodeFromBytes, encodeToBytes } from "../../util/utf8";
import { StartFileId } from "../../const";

loader.config({ paths: { vs: "https://gw.alipayobjects.com/os/lib/monaco-editor/0.36.1/min/vs" } });

type MonacoType = typeof MonacoNS;

function getModel(monaco: MonacoType, value: string, language: string, path: string) {
  const uri = monaco.Uri.parse(path);
  const prev = monaco.editor.getModel(uri);
  return prev || monaco.editor.createModel(value, language, uri);
}

const Readme = `Aiming to provide an interactive online Linux VM

You can view the project source code here 
https://github.com/muzea/server-box


The default image size is 230M and may take several minutes to load for the first time.

The sidebar on the left will show you the files in the /mnt directory. You can use touch to create files and mkdir to create directories in the terminal at the bottom, and the file tree on the left will automatically synchronize with the changes in response.

You can use Ctrl-s save file change to disk.

The system has gcc/python built in, so you can create a .c/.py file and run them.


Known issues

- gcc compilation results can not work under /mnt (run the .out file will cause system crashes), you need to mv the .out file to /tmp for execution
- df does not currently work, fs does not currently implement stats correctly (this type of operation also causes system crashes)
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
        wordWrap: "on",
      });

      editorRef.current = editor;

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
        const model = editor.getModel();
        if (model && model !== defalutModel) {
          const idx = model.uri.path.substring(1);
          const buffer = encodeToBytes(model.getValue());

          writeFile(idx, buffer);
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
      if (state.currentIdx !== StartFileId) {
        console.log("handleFileSelect", state.currentIdx);

        const uri = monaco.Uri.parse(String(state.currentIdx));
        const prev = monaco.editor.getModel(uri);

        if (prev) {
          editorRef.current?.setModel(prev);
          return;
        }
        readFile(state.currentIdx).then((data) => {
          const model = getModel(
            monaco,
            data ? decodeFromBytes(new Uint8Array(data)) : "",
            fileIdMap.exts[getExtWithDot(getName(getInodePath(state.currentIdx)))],
            String(state.currentIdx)
          );

          editorRef.current?.setModel(model);
        });
      }
    });
  }, []);

  return <div className={styles.editor} ref={handleDomMount} />;
}
