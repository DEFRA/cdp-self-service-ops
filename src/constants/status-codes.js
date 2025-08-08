/**
 * @typedef {Record<string, number>} StatusCodes
 */
export const statusCodes = {
  ok: 200,
  noContent: 204,
  miscellaneousPersistentWarning: 299,
  redirect: 302,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  imATeapot: 418,
  internalError: 500,
  serviceUnavailable: 503
}
