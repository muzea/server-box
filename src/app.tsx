import { useEffect, useRef } from "react";
import { bootV86 } from "./boot";
import { V86Starter } from "@woodenfish/libv86";
import { saveGlobalFs, useFs } from "./state/fs";
import { encodeToBytes } from "./util/utf8";
import Layout from "./component/layout";

function App() {
  const starter = useRef<Promise<V86Starter>>();
  useEffect(() => {
    if (!starter.current) {
      const bootPromise = bootV86({
        serial_container_xtermjs: document.getElementById("terminal")!,
        // screen_container: document.getElementById("screen_container")!,
      });

      bootPromise.then((instance) => {
        instance.add_listener("emulator-loaded", () => {
          instance.serial_adapter.term.setOption("theme", { background: "#1e1e1e" });
          instance.mount_fs("/project", undefined, undefined, async (res: any) => {
            console.log("mount_fs", res);

            await instance.create_file("/project/test.py", encodeToBytes("print('Hello World!')\n"));
            // @ts-ignore
            saveGlobalFs(instance.fs9p!);

            useFs.getState().SyncWith9p();
          });
        });
      });

      starter.current = bootPromise;
    }
  }, []);

  return <Layout />;
}

export default App;
