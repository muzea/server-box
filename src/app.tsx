import { useEffect, useRef } from "react";
import { bootV86 } from "./boot";
import { V86Starter } from "@woodenfish/libv86";
import { createFile, useFs, writeFile } from "./state/fs";
import { encodeToBytes } from "./util/utf8";
import Layout from "./component/layout";
import { notification } from "antd";
import fs9p from "./fs";

function App() {
  const starter = useRef<Promise<V86Starter>>();

  useEffect(() => {
    if (!starter.current) {
      fs9p.install();
      // useFs.getState().SyncWith9p();

      // createFile("/", "test.py", "# test");
      // //@ts-ignore
      // starter.current = true;
      // return;
      notification.info({
        message: "The debian image is a bit large and will take a long time to load for the first time",
        placement: "bottomRight",
      });

      const bootPromise = bootV86({
        // serial_container_xtermjs: document.getElementById("terminal")!,
        // screen_container: document.getElementById("screen_container")!,
      });

      bootPromise.then((instance) => {
        instance.add_listener("emulator-loaded", () => {
          const term = instance.serial_adapter.term;
          term.options.theme = {
            ...term.options.theme,
            background: "#1e1e1e",
          };
          instance.serial0_send("\n");
          // instance.mount_fs("/project", undefined, undefined, async (res: any) => {
          //   console.log("mount_fs", res);

          //   setTimeout(() => {
          //     term.reset();
          //     instance.serial0_send("cd /project\nclear\n");
          //   }, 0);

          //   await instance.create_file("/project/test.py", encodeToBytes("print('Hello World!')\n"));
          //   // @ts-ignore
          //   saveGlobalFs(instance.fs9p!);

          //   useFs.getState().SyncWith9p();
          // });
        });
      });

      starter.current = bootPromise;
    }
  }, []);

  return <Layout />;
}

export default App;
