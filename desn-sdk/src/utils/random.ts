export function randomNum(minNum, maxNum) {
  let fn = (n0: number, n1: number) =>
    parseInt(String(Math.random() * ((n1 !== undefined ? n1 : 2 * n0) - n0 + 1)), 10)
  return [fn(minNum, maxNum), fn(minNum, maxNum)]
}