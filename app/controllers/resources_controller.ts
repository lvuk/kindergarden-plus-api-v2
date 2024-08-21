import Resource from '#models/resource'
import ResourceValidator from '#validators/ResourceValidator'
import type { HttpContext } from '@adonisjs/core/http'

export default class ResourcesController {
  //list all resources
  async index({ request, response }: HttpContext) {
    const page = request.param('page', 1) || 1
    const perPage = 10
    const resources = await Resource.query().paginate(page, perPage)

    if (!resources) return response.status(404).json({ error: 'No resources found' })

    return response.status(200).json(resources)
  }

  //create new resource
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: ResourceValidator.createSchema,
      messages: ResourceValidator.messages,
    })

    const resource = await Resource.create(data)
    return response.status(201).json(resource)
  }

  //show individual resource
  async show({ params, response }: HttpContext) {
    const resource = await Resource.query(params.id).first()

    if (!resource) return response.status(404).json({ error: 'Resource not found' })

    return response.status(200).json(resource)
  }

  //update resource
  async update({ params, request, response }: HttpContext) {
    const data = await request.validate({
      schema: ResourceValidator.updateSchema,
      messages: ResourceValidator.messages,
    })

    const resource = await Resource.query(params.id).first()

    if (!resource) return response.status(404).json({ error: 'Resource not found' })

    resource.merge(data)
    await resource.save()

    return response.status(200).json(resource)
  }

  //delete
  async destroy({ params, response }: HttpContext) {
    const resource = await Resource.query(params.id).first()

    if (!resource) return response.status(404).json({ error: 'Resource not found' })

    return response.status(200).json({ message: 'Resource deleted' })
  }
}
