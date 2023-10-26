// given a github create-PR response, extract the fields we're interested in
function trimPr(pr) {
  return {
    number: pr?.number,
    sha: pr?.head.sha,
    ref: pr?.head.ref,
    html_url: pr?.html_url,
    node_id: pr?.node_id
  }
}

export { trimPr }
