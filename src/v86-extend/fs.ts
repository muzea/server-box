// @ts-nocheck
import { fs, Path, Buffer } from "filer";
const sh = new fs.Shell();

// Expose fs on window for people to play on the console if they want
window.fs = fs;
// Use node's lowercase style `p` path
window.path = Path;
window.Buffer = Buffer;

/**
 * Put some files in the filesystem on the first run
 */
function install() {
  // const html = "<h1>Hello World</h1>";
  // fs.writeFile("/hello-world.html", html, (err) => {
  //   if (err) console.error("unable to write html file!", err);
  // });
}

const fs9p = {
  install,
  fs,
  sh,
  Path,
  Buffer,
  fsp: fs.promises,
};

export default fs9p;
