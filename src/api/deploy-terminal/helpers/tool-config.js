/**
 * Expands out the selected tool to a image + image tag.
 * @type {Object.<string, {image:string, image_version: string, timeout_minutes: int}>}
 */
export const toolConfig = {
  terminal: {
    image: 'cdp-webshell',
    image_version: 'stable',
    timeout_minutes: 120
  },
  terminal_latest: {
    image: 'cdp-webshell',
    image_version: 'latest',
    timeout_minutes: 120
  },
  pgweb: {
    image: 'cdp-pgweb',
    image_version: 'stable',
    timeout_minutes: 60 * 6
  },
  pgweb_latest: {
    image: 'cdp-pgweb',
    image_version: 'latest',
    timeout_minutes: 60 * 6
  }
}
