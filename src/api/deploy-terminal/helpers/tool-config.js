/**
 * Expands out the selected tool to a image + image tag.
 * @type {Object.<string, {image:string, image_version: string, timeout_minutes: int, idle_timeout_minutes: int}>}
 */
export const toolConfig = {
  terminal: {
    image: 'cdp-webshell',
    image_version: 'stable',
    timeout_minutes: 60 * 8,
    idle_timeout_minutes: 60
  },
  terminal_latest: {
    image: 'cdp-webshell',
    image_version: 'latest',
    timeout_minutes: 60 * 8,
    idle_timeout_minutes: 60
  },
  pgweb: {
    image: 'cdp-pgweb',
    image_version: 'stable',
    timeout_minutes: 60 * 8,
    idle_timeout_minutes: 60
  },
  pgweb_latest: {
    image: 'cdp-pgweb',
    image_version: 'latest',
    timeout_minutes: 60 * 8,
    idle_timeout_minutes: 60
  },
  dbgate: {
    image: 'cdp-dbgate',
    image_version: 'stable',
    timeout_minutes: 60 * 8,
    idle_timeout_minutes: 60
  },
  dbgate_latest: {
    image: 'cdp-dbgate',
    image_version: 'latest',
    timeout_minutes: 60 * 8,
    idle_timeout_minutes: 60
  }
}
