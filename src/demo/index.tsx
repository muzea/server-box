import { Classes, HTMLSelect } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
// @ts-ignore
import dropRight from "lodash/dropRight";
import React from "react";

import {
  Corner,
  createBalancedTreeFromLeaves,
  getLeaves,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  Mosaic,
  MosaicBranch,
  MosaicDirection,
  MosaicNode,
  MosaicParent,
  MosaicWindow,
  MosaicZeroState,
  updateTree,
} from "react-mosaic-component";

import { CloseAdditionalControlsButton } from "./CloseAdditionalControlsButton";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./carbon.less";
import "./example.less";

import Editor from "@monaco-editor/react";
import loader from '@monaco-editor/loader';
loader.config({ paths: { vs: 'https://gw.alipayobjects.com/os/lib/monaco-editor/0.36.1/min/vs' } });

const version = "0.0.1";

export const THEMES = {
  ["Blueprint"]: "mosaic-blueprint-theme",
  ["Blueprint Dark"]: classNames("mosaic-blueprint-theme", Classes.DARK),
  ["None"]: "",
};

export type Theme = keyof typeof THEMES;

const additionalControls = React.Children.toArray([
  <CloseAdditionalControlsButton />,
]);

const EMPTY_ARRAY: any[] = [];

export interface ExampleAppState {
  currentNode: MosaicNode<number> | null;
  currentTheme: Theme;
}

export class ExampleApp extends React.PureComponent<{}, ExampleAppState> {
  state: ExampleAppState = {
    currentNode: {
      direction: "row",
      first: 1,
      second: {
        direction: "row",
        first: {
          direction: "column",
          first: 2,
          second: 3,
        },
        second: 4,
      },
      splitPercentage: 10,
    },
    currentTheme: "Blueprint Dark",
  };

  render() {
    const totalWindowCount = getLeaves(this.state.currentNode).length;
    return (
      <div className="react-mosaic-example-app">
        {this.renderNavBar()}
        <Mosaic<number>
          renderTile={(count, path) => (
            <ExampleWindow
              count={count}
              path={path}
              totalWindowCount={totalWindowCount}
            />
          )}
          zeroStateView={
            <MosaicZeroState createNode={() => totalWindowCount + 1} />
          }
          value={this.state.currentNode}
          onChange={this.onChange}
          onRelease={this.onRelease}
          className={THEMES[this.state.currentTheme]}
          blueprintNamespace="bp4"
        />
      </div>
    );
  }

  private onChange = (currentNode: MosaicNode<number> | null) => {
    this.setState({ currentNode });
  };

  private onRelease = (currentNode: MosaicNode<number> | null) => {
    console.log("Mosaic.onRelease():", currentNode);
  };

  private autoArrange = () => {
    const leaves = getLeaves(this.state.currentNode);

    this.setState({
      currentNode: createBalancedTreeFromLeaves(leaves),
    });
  };

  private addToTopRight = () => {
    let { currentNode } = this.state;
    const totalWindowCount = getLeaves(currentNode).length;
    if (currentNode) {
      const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
      const parent = getNodeAtPath(
        currentNode,
        dropRight(path)
      ) as MosaicParent<number>;
      const destination = getNodeAtPath(
        currentNode,
        path
      ) as MosaicNode<number>;
      const direction: MosaicDirection = parent
        ? getOtherDirection(parent.direction)
        : "row";

      let first: MosaicNode<number>;
      let second: MosaicNode<number>;
      if (direction === "row") {
        first = destination;
        second = totalWindowCount + 1;
      } else {
        first = totalWindowCount + 1;
        second = destination;
      }

      currentNode = updateTree(currentNode, [
        {
          path,
          spec: {
            $set: {
              direction,
              first,
              second,
            },
          },
        },
      ]);
    } else {
      currentNode = totalWindowCount + 1;
    }

    this.setState({ currentNode });
  };

  private renderNavBar() {
    return (
      <div className={classNames(Classes.NAVBAR, Classes.DARK)}>
        <div className={Classes.NAVBAR_GROUP}>
          <div className={Classes.NAVBAR_HEADING}>
            <a href="https://github.com/nomcopter/react-mosaic">
              server-box <span className="version">v{version}</span>
            </a>
          </div>
        </div>
        <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)}>
          <label
            className={classNames(
              "theme-selection",
              Classes.LABEL,
              Classes.INLINE
            )}
          >
            Theme:
            <HTMLSelect
              value={this.state.currentTheme}
              onChange={(e) =>
                this.setState({ currentTheme: e.currentTarget.value as Theme })
              }
            >
              {React.Children.toArray(
                Object.keys(THEMES).map((label) => <option>{label}</option>)
              )}
            </HTMLSelect>
          </label>
          <div className="navbar-separator" />
          <span className="actions-label">Example Actions:</span>
          <button
            className={classNames(
              Classes.BUTTON,
              Classes.iconClass(IconNames.GRID_VIEW)
            )}
            onClick={this.autoArrange}
          >
            Auto Arrange
          </button>
          <button
            className={classNames(
              Classes.BUTTON,
              Classes.iconClass(IconNames.ARROW_TOP_RIGHT)
            )}
            onClick={this.addToTopRight}
          >
            Add Window to Top Right
          </button>
          <a
            className="github-link"
            href="https://github.com/nomcopter/react-mosaic"
          >
            <img src={""} />
          </a>
        </div>
      </div>
    );
  }
}

interface ExampleWindowProps {
  count: number;
  path: MosaicBranch[];
  totalWindowCount: number;
}

function RenderTerminal() {
  return (
    <div
      id="terminal"
      className="hide-scrollbar"
      style={{ height: "100%", width: "100%" }}
    />
  );
}

function RenderEditor() {
  return (
    <div id="editor" style={{ height: "100%", width: "100%" }}>
      <Editor
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// some comment"
      />
    </div>
  );
}

function RenderScreen() {
  return (
    <div id="screen_container" style={{ display: "none" }}>
      <div id="screen"></div>
      <canvas id="vga"></canvas>
    </div>
  );
}

const TitleMap: Record<number, string> = {
  1: "Project",
  3: "Terminal",
  4: "Preview",
};

const ExampleWindow = ({
  count,
  path,
  totalWindowCount,
}: ExampleWindowProps) => {
  return (
    <MosaicWindow<number>
      toolbarControls={EMPTY_ARRAY}
      title={TitleMap[count]}
      path={path}
      draggable={false}
      renderToolbar={
        count === 2
          ? () => <div className="toolbar-example">Custom Toolbar</div>
          : null
      }
    >
      <div className="example-window">
        {count === 1 ? <div>文件数</div> : null}
        {count === 2 ? <RenderEditor /> : null}
        {count === 3 ? <RenderTerminal /> : null}
        {count > 3 ? <div>{count}</div> : null}
      </div>
    </MosaicWindow>
  );
};
