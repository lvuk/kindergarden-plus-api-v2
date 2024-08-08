import Kindergarden from '#models/kindergarden'
import KindergardenValidator from '#validators/KindergardenValidator'
import type { HttpContext } from '@adonisjs/core/http'

export default class KindergardensController {
  //all kindergardens
  async index({ request, response }: HttpContext) {
    const page = request.param('page', 1)
    const limit = 10
    const kindergardens = await Kindergarden.query().paginate(page, limit)

    if (kindergardens.isEmpty) {
      return response.status(404).json({ error: 'No kindergardens to show' })
    }

    return response.status(200).json(kindergardens)
  }

  //register new kindergarden
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: KindergardenValidator.createSchema,
      messages: KindergardenValidator.messages,
    })

    const kindergarden = await Kindergarden.create(data)

    return response.status(201).json(kindergarden)
  }

  //show individual kindergarden
  async show({ response, params }: HttpContext) {
    const kindergarden = await Kindergarden.find(params.id)

    if (!kindergarden) return response.status(404).json({ error: 'Kindergarden not found' })

    return response.status(200).json(kindergarden)
  }

  //update kindergarden
  async update({ params, request, response }: HttpContext) {
    const kindergarden = await Kindergarden.find(params.id)

    if (!kindergarden) return response.status(404).json({ error: 'Kindergarden not found' })

    const payload = await request.validate({
      schema: KindergardenValidator.updateSchema,
      messages: KindergardenValidator.messages,
    })

    kindergarden.merge(payload)
    await kindergarden.save()

    return response.status(200).json({ message: 'User successfully updated', kindergarden })
  }

  //delete kidnergarden
  async destroy({ params, response }: HttpContext) {
    const kindergarden = await Kindergarden.find(params.id)

    if (!kindergarden) return response.status(404).json({ error: 'Kindergarden not found' })

    await kindergarden.delete()
    return response.status(200).json({ message: 'Kindergarden successfully deleted' })
  }
}
