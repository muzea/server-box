export function getName(filePath: string) {
  const list = filePath.split("/");
  return list[list.length - 1];
}

export function getExtWithDot(fileName: string) {
  const list = fileName.split(".");
  return "." + list[list.length - 1];
}
