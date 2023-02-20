import Monaco from "@monaco-editor/react";

declare module "*.module.less" {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

declare global {
  interface Window {
    monaco_react: Monaco;
  }
}
