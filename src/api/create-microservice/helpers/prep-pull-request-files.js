function prepPullRequestFiles(prMap) {
  prMap.forEach((value, key, map) => {
    if (!value) {
      map.delete(key)
    }
  })

  return Object.fromEntries(prMap.entries())
}

export { prepPullRequestFiles }
