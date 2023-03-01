const fs = require("fs/promises");

const packSize = {
  0: 70501191,
  1: 49793964,
  2: 108057402,
  3: 46799915,
  4: 34876371,
  5: 39714117,
  6: 39013277,
  7: 54477334,
  8: 37915282,
  9: 71353500,
  a: 44828643,
  b: 67505288,
  c: 38590837,
  d: 64856345,
  e: 39629501,
  f: 31098888,
};

const base = "./images/debian/10-full/debian-9p-rootfs-flat";
const packDist = "./images/debian/10-full/debian-9p-rootfs-pack-v2";

async function main() {
  const result = await fs.readdir(base);
  const map = {};

  for (const name of result) {
    const prefix = name.substring(0, 2);
    if (!map[prefix]) map[prefix] = [];

    const fileFullName = `${base}/${name}`;
    const file = await fs.stat(fileFullName);
    const hash = name.split(".")[0];

    map[prefix].push(hash);
    map[prefix].push(file.size);

    const buff = await fs.readFile(fileFullName);
    await fs.appendFile(`${packDist}/${prefix}.pack`, buff);
  }

  for (const prefix of Object.keys(map)) {
    await fs.writeFile(`${packDist}/${prefix}.map.json`, JSON.stringify(map[prefix]));
  }

  console.log("pack done");
}

main();

// async function check() {
//   for (const prefix of Object.keys(packSize)) {
//     const fileFullName = `${packDist}/${prefix}.pack`;
//     const file = await fs.stat(fileFullName);
//     if (file.size !== packSize[prefix]) {
//       console.error("size not match");
//     }
//   }
//   console.log("check done");
// }

// check();
