async function flushPromises() {
  await new Promise(() => process.nextTick())
}

export { flushPromises }
