const catchAll = function (request, h) {
  const { response } = request

  if (!response.isBoom) {
    return h.continue
  }

  return h
    .response({
      message: response.output.payload.error
    })
    .code(response.output.statusCode)
}

export { catchAll }
