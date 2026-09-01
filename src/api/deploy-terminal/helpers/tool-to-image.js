/**
 * Expands out the selected tool to a image + image tag.
 * @type {Object.<string, {image:string, image_version: string}>}
 */
export const toolToImage = {
  terminal: {
    image: 'cdp-webshell',
    image_version: 'stable'
  },
  terminal_latest: {
    image: 'cdp-webshell',
    image_version: 'latest'
  },
  pgweb: {
    image: 'cdp-pgweb',
    image_version: 'stable'
  },
  pgweb_latest: {
    image: 'cdp-pgweb',
    image_version: 'latest'
  }
}
