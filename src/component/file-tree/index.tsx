import * as React from "react";
// @ts-ignore
import clx from "classnames";
// @ts-ignore
import fileIconInfo from "@woodenfish/vscode-icon-map-seti";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import FileTreeContextMenu from "../context-menu";
import "./style.less";

interface FileRowProps {
  item: InnerFileItem;
  selected: string;
  expend: boolean;
  handleSelect: (node: InnerFileItem) => void;
  toggleExpend: (id: string) => void;
}

function tryMatchEnd(fileName: string) {
  for (let fileExt of Object.keys(fileIconInfo.languageIds)) {
    if (fileName.endsWith(fileExt)) {
      return fileIconInfo.languageIds[fileExt];
    }
  }
}

function getFileInfo(fileName: string): {
  fontCharacter: string;
  fontColor: string;
} {
  const list = fileName.split(".");
  const ext = `.${list[list.length - 1]}`;
  const type = fileIconInfo.exts[ext];
  const id = fileIconInfo.languageIds[type] || fileIconInfo.languageIds[list[list.length - 1]] || tryMatchEnd(fileName);

  return fileIconInfo.iconDefinitions[id];
}

function FileIcon(props: { fileName: string; isDirectory?: boolean; expend?: boolean }) {
  if (props.isDirectory) {
    return (
      <div
        className={clx(
          "file-tree-row-icon",
          "codicon",
          props.expend ? "codicon-chevron-down" : "codicon-chevron-right"
        )}
      />
    );
  }
  const info = getFileInfo(props.fileName);
  if (!info) return <div className={clx("file-tree-row-icon", "codicon", "codicon-file")} />;
  return (
    <div className="file-tree-row-icon seti-icon" style={{ color: info.fontColor }}>
      {String.fromCharCode(parseInt(info.fontCharacter.replace("\\", ""), 16))}
    </div>
  );
}

function FileRow(props: FileRowProps) {
  const { selected, item, handleSelect, toggleExpend, expend } = props;
  const klass = clx("file-tree-row", item.id === selected && "selected");

  const handleClick = React.useCallback(() => {
    toggleExpend(item.id);
    handleSelect(item);
  }, []);

  const handleContextMenu = React.useCallback(() => {
    handleSelect(item);
  }, []);

  return (
    <div className={klass} tabIndex={0} onClick={handleClick} onContextMenu={handleContextMenu}>
      <div className="file-tree-row-indent" style={{ width: 4 + 8 * item.indent }} />
      <FileIcon fileName={item.fileName} isDirectory={item.isDirectory} expend={expend} />
      <div className="file-tree-row-label">{item.fileName}</div>
    </div>
  );
}

function FileNewRow(props: { isDirectory?: boolean; indent: number; handleDiscard: (name?: string) => void }) {
  const { isDirectory, indent } = props;
  const value = React.useRef("");

  const autofocus = React.useCallback((dom: any) => {
    if (dom) {
      // FIX_ME
      // hack autofocus
      setTimeout(() => {
        (dom as HTMLDivElement).shadowRoot?.querySelector("input")?.focus();
      }, 50);
    }
  }, []);

  const handleDiscard = React.useCallback((e: React.FocusEvent) => {
    props.handleDiscard(value.current);
  }, []);

  const handleEnter = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      props.handleDiscard(value.current);
    } else if (e.key === "Escape") {
      props.handleDiscard();
    }
  }, []);

  const handleInput = React.useCallback((e: any) => {
    value.current = e.target.value;
  }, []);

  return (
    <div className="file-tree-row" tabIndex={0}>
      <div className="file-tree-row-indent" style={{ width: 4 + 8 * indent }} />
      <FileIcon fileName="no.name" isDirectory={isDirectory} />
      <div className="file-tree-row-label" onKeyDown={handleEnter} onBlur={handleDiscard}>
        <VSCodeTextField ref={autofocus} size={100} onInput={handleInput} />
      </div>
    </div>
  );
}

interface FileItemFile {
  id: string;
  fileName: string;
  isDirectory: false;
}

interface FileItemDirectory {
  id: string;
  fileName: string;
  isDirectory: true;
  children: FileItem[];
}

export type FileItem = FileItemDirectory | FileItemFile;

interface FileItemFile {
  id: string;
  fileName: string;
  isDirectory: false;
}

interface InnerFileItem {
  id: string;
  pid: string;
  indent: number;
  fileName: string;
  isDirectory: boolean;
}

export interface FileTreeProps {
  list: FileItem[];
  onNewFile(pid: string, fileName: string): void;
  onNewDirectory(pid: string, dirName: string): void;
  onSelect(id: FileItem): void;
}

function flatten(pid: string, indent: number, expend: string[], list: FileItem[]): InnerFileItem[] {
  const ret: InnerFileItem[] = [];
  for (let it of list) {
    ret.push({
      id: it.id,
      pid,
      indent,
      fileName: it.fileName,
      isDirectory: it.isDirectory,
    });

    if (it.isDirectory && expend.includes(it.id)) {
      ret.push(...flatten(it.id, indent + 1, expend, it.children));
    }
  }
  return ret;
}

const EmptyArr: string[] = [];

enum NewFileState {
  None = 0,
  File = 1,
  Dir = 2,
}

const Root = "root";

export default function FileTree(props: FileTreeProps) {
  const [selected, setSelected] = React.useState(Root);
  const selectedRef = React.useRef(Root);
  const [createNewFile, setCreateNewFile] = React.useState(NewFileState.None);

  const [expend, setExpend] = React.useState<string[]>(EmptyArr);
  const list = React.useMemo(() => {
    return flatten(Root, 1, expend, props.list);
  }, [props.list, expend]);

  const toggleExpend = React.useCallback((nextId: string) => {
    setExpend((prev) => {
      if (prev.includes(nextId)) {
        return prev.filter((it) => it !== nextId);
      }
      return prev.concat(nextId);
    });
  }, []);

  const handleSelect = React.useCallback((node: InnerFileItem) => {
    setSelected(node.id);
    props.onSelect && props.onSelect(node as FileItem);
    selectedRef.current = node.id;
  }, []);
  const handleNewFile = React.useCallback(() => {
    if (selectedRef.current !== Root) {
      setExpend((prev) => {
        if (!prev.includes(selectedRef.current)) {
          return prev.concat(selectedRef.current);
        }
        return prev;
      });
    }
    setCreateNewFile(NewFileState.File);
  }, []);
  const handleNewDir = React.useCallback(() => {
    setCreateNewFile(NewFileState.Dir);
  }, []);

  const handleDiscardNewFile = React.useCallback(
    (newFileName?: string) => {
      setCreateNewFile((prev) => {
        if (newFileName) {
          // callback add file
          if (prev === NewFileState.File) {
            props.onNewFile && props.onNewFile(selected, newFileName);
          } else {
            props.onNewDirectory && props.onNewDirectory(selected, newFileName);
          }
        }

        return NewFileState.None;
      });
    },
    [selected, props.onNewFile, props.onNewDirectory]
  );

  const handleRootRightClick = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      setSelected(Root);
    }
  }, []);

  return (
    <div className="file-tree">
      <FileTreeContextMenu onNewFile={handleNewFile} onNewFolder={handleNewDir}>
        <div className="file-tree-list" onContextMenu={handleRootRightClick}>
          {selected === Root && createNewFile !== NewFileState.None ? (
            <React.Fragment key="0_group">
              <FileNewRow
                key="new"
                isDirectory={createNewFile === NewFileState.Dir}
                indent={1}
                handleDiscard={handleDiscardNewFile}
              />
            </React.Fragment>
          ) : null}
          {list.map((it) => {
            if (selected === it.id && createNewFile !== NewFileState.None) {
              return (
                <React.Fragment key={`${it.id}_group`}>
                  <FileRow
                    key={it.id}
                    item={it}
                    selected={selected}
                    handleSelect={handleSelect}
                    toggleExpend={toggleExpend}
                    expend={expend.includes(it.id)}
                  />
                  <FileNewRow
                    key="new"
                    isDirectory={createNewFile === NewFileState.Dir}
                    indent={it.isDirectory ? it.indent + 1 : it.indent}
                    handleDiscard={handleDiscardNewFile}
                  />
                </React.Fragment>
              );
            }
            return (
              <FileRow
                key={it.id}
                item={it}
                selected={selected}
                handleSelect={handleSelect}
                toggleExpend={toggleExpend}
                expend={expend.includes(it.id)}
              />
            );
          })}
        </div>
      </FileTreeContextMenu>
    </div>
  );
}
