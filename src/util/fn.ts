export function debounce<T extends (...option: any[]) => void>(fn: T): T {
  let timer = 0;
  return function debounceWrap(...option: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, 100, ...option) as any as number;
  } as any;
}
