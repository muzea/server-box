import { useEffect, useRef } from "react";
import { ExampleApp } from "./demo";

import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { Starter } from "./vm";
import { bootV86 } from "./boot";

function str2ab(str: string) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return new Uint8Array(buf);
}

function App() {
  const starter = useRef<Starter>();
  useEffect(() => {
    if (!starter.current) {
      const instance = bootV86({
        serial_container_xtermjs: document.getElementById("terminal")!,
        filesystem: true,
        // screen_container: document.getElementById("screen_container")!,
      });

      instance.add_listener("emulator-loaded", () => {
        instance.mount_fs('/project');
        instance.create_file('/project/main.js', str2ab("console.log('Hello World')"))
      })

      starter.current = instance;
    }
  }, []);

  return <ExampleApp />;
}

export default App;
