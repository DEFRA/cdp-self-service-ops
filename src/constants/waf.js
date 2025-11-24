/**
 * @type {{externalPublic: string, internalPublic: string, internalProtected: string, apiPublic: string, apiPrivate: string}}
 */
const waf = {
  externalPublic: 'external_public',
  internalPublic: 'internal_public',
  internalProtected: 'internal_protected',
  apiPublic: 'api_public',
  apiPrivate: 'api_private'
}

const shutterUrlType = {
  frontendVanityUrl: 'frontend_vanity_url',
  apigwVanityUrl: 'apigw_vanity_url'
}

export { waf, shutterUrlType }
