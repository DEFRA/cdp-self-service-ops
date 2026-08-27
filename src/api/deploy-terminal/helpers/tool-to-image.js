/**
 * Expands out the selected tool to a image + image tag.
 * @type {Object.<string, {image:string, image_version: string}>}
 */
export const toolToImage = {
  terminal: {
    image: 'cdp-webshell',
    image_version: 'stable'
  },
  pgweb: {
    image: 'cdp-pgweb',
    image_version: 'latest'
  }
}
