export function antiShaking(timeout?: number) {
  let todo
  let lock
  return {
    push(fn: Function) {
      todo = fn

      if (!lock) {
        lock = 1

        setTimeout(() => {
          lock = void 0
          todo()
        }, timeout || 0)
      }
    }
  }
}
