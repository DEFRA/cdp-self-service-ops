import { getEntity } from '../../../helpers/portal-backend/get-entity.js'

export function provideEntity(getEntityName) {
  return async function (request, h) {
    const entityName = getEntityName(request)

    if (entityName) {
      request.app.entity = await getEntity(entityName)
    }

    return h.continue
  }
}
