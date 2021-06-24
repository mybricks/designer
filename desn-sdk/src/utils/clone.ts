export function deepClone(obj) {
  return obj !== void 0 && obj !== null ? JSON.parse(JSON.stringify(obj)) : obj
}