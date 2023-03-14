declare module "*.module.less" {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module "filer" {
  import FS from "fs";
  import PATH from "path";

  // interface Stats {
  //   /**
  //    * internal node id (unique)
  //    */
  //   node: string;
  //   /**
  //    * file system name
  //    */
  //   dev: string;
  //   /**
  //    * the entry's name (basename)
  //    */
  //   name: string;
  //   /**
  //    * file size in bytes
  //    */
  //   size: number;
  //   /**
  //    * number of links
  //    */
  //   nlinks: number;
  //   /**
  //    * last access time as JS Date Object
  //    */
  //   atime: Date;
  //   /**
  //    * last modified time as JS Date Object
  //    */
  //   mtime: Date;
  //   /**
  //    * creation time as JS Date Object
  //    */
  //   ctime: Date;
  //   /**
  //    * last access time as Unix Timestamp
  //    */
  //   atimeMs: number;
  //   /**
  //    * last modified time as Unix Timestamp
  //    */
  //   mtimeMs: number;
  //   /**
  //    * creation time as Unix Timestamp
  //    */
  //   ctimeMs: number;
  //   /**
  //    * file type (FILE, DIRECTORY, DIRECTORY),
  //    */
  //   type: "FILE" | "DIRECTORY" | "DIRECTORY";
  //   /**
  //    * group name
  //    */
  //   gid: number;
  //   /**
  //    * owner name
  //    */
  //   uid: number;
  //   /**
  //    * permissions
  //    */
  //   mode: number;
  //   /**
  //    * version of the node
  //    */
  //   version: number;
  // }
  // interface FS {
  //   stat(path: string, callback: (err: any, stats: Stats) => void): void;
  //   stat(path: string): Promise<{ err: any; stats: Stats }>;
  // }
  const fs: typeof FS;
  const Path: typeof PATH;
  export = {
    fs,
    Path,
  };
}
