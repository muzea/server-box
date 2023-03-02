import { useEffect, useRef } from "react";
import { ExampleApp } from "./demo";

import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { bootV86 } from "./boot";
import { V86Starter } from "@woodenfish/libv86";
import { saveGlobalFs, useFs } from "./state/fs"
import { encodeToBytes } from "./util/utf8";

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
          instance.mount_fs("/project", undefined, undefined, (res: any) => {
            console.log("mount_fs", res);

            instance.create_file(
              "/project/test.py",
              encodeToBytes("print('Hello World!')\n")
            );
            // @ts-ignore
            saveGlobalFs(instance.fs9p!);

            useFs.getState().SyncWith9p();
          });
        });
      })


      starter.current = bootPromise;
    }
  }, []);

  return <ExampleApp />;
}

export default App;
