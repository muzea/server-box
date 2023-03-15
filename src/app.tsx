import { useEffect, useRef } from "react";
import { bootV86 } from "./boot";
import { V86Starter } from "@woodenfish/libv86";
import { useFs } from "./state/fs";
import Layout from "./component/layout";
import { notification } from "antd";

function App() {
  const starter = useRef<Promise<V86Starter>>();

  useEffect(() => {
    if (!starter.current) {
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
          useFs.getState().SyncWith9p();
        });
      });

      starter.current = bootPromise;
    }
  }, []);

  return <Layout />;
}

export default App;
