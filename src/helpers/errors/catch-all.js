function catchAll(request, h) {
  const { response } = request

  if (!response.isBoom) {
    return h.continue
  }

  request.logger.error(response.output.payload, response?.stack)

  return h
    .response({
      message: response.output.payload.message,
      error: response.output.payload.error
    })
    .code(response.output.statusCode)
}

export { catchAll }
