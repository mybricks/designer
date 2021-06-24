export default function ({env, slots}) {
  if (env.runtime) {
    const names = Object.keys(slots)
    const slotName = names[0]

    // Object.values(frames).forEach(frame => {
    //   frame(void 0,slotName)
    // })

    return slots[slotName].render(null,slotName)
  }
}