const healthController = {
  handler: (request, h) => {
    return h.response({ message: 'healthy' }).code(200)
  }
}

export { healthController }
