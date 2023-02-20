import { useEffect, useRef } from "react";
import { ExampleApp } from "./demo";

import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { bootV86, Emulator } from "./boot";

function App() {
  const emulator = useRef<Emulator>();
  useEffect(() => {
    if (!emulator.current) {
      emulator.current = bootV86({
        serial_container_xtermjs: document.getElementById("terminal")!,
        screen_container: document.getElementById("screen_container")!,
      });
    }
  }, []);

  return <ExampleApp />;
}

export default App;
