import Kindergarden from '#models/kindergarden'
import NonWorkingDay from '#models/non_working_day'
import NonWorkingDayValidator from '#validators/NonWorkingDayValidator'
import type { HttpContext } from '@adonisjs/core/http'

export default class NonworkingdaysController {
  //list all non-working days
  async index({ request, response }: HttpContext) {
    const kindergarden = await Kindergarden.query().where('id', request.qs().kindergardenId).first()
    if (!kindergarden)
      return response
        .status(404)
        .json({ error: `Kindergarden with ID: ${request.qs().kindergardenId} does not exists` })

    const nonWorkingDays = await NonWorkingDay.query().where('kindergardenId', kindergarden.id)
    return response.status(200).json(nonWorkingDays)
  }

  //add new non-working day
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: NonWorkingDayValidator.createSchema,
      messages: NonWorkingDayValidator.messages,
    })

    const kindergarden = await Kindergarden.find(data.kindergardenId)
    if (!kindergarden)
      return response
        .status(404)
        .json({ error: `Kindergarden with ID: ${data.kindergardenId} does not exists` })

    const workingDayExists = await NonWorkingDay.query()
      .where('kindergardenId', data.kindergardenId)
      .where('day', data.day.toISODate()!.toString())
      .first()

    if (workingDayExists)
      return response.status(400).json({
        error: `Non-working day at ${data.day.toFormat('dd-MM-yyyy')} already exists for that kindergarden`,
      })

    const workingDay = await NonWorkingDay.create(data)

    return response.status(201).json(workingDay)
  }

  //show individual non-working day
  async show({ response, params }: HttpContext) {
    const workingDay = await NonWorkingDay.find(params.id)
    if (!workingDay)
      return response
        .status(404)
        .json({ error: `Non-working day with ID: ${params.id} does not exists` })

    return response.status(200).json(workingDay)
  }

  //edit non-working day
  async update({ params, request, response }: HttpContext) {
    const data = await request.validate({
      schema: NonWorkingDayValidator.updateSchema,
      messages: NonWorkingDayValidator.messages,
    })

    const nonWorkingDay = await NonWorkingDay.find(params.id)
    if (!nonWorkingDay)
      return response
        .status(404)
        .json({ error: `Non-working day with ID: ${params.id} does not exists` })

    nonWorkingDay.merge(data)
    await nonWorkingDay.save()

    return nonWorkingDay
  }

  //delete non-working day
  async destroy({ params, response }: HttpContext) {
    const workingDay = await NonWorkingDay.find(params.id)
    if (!workingDay)
      return response
        .status(404)
        .json({ error: `Non-working day with ID: ${params.id} does not exists` })

    await workingDay.delete()
    return response.status(200).json({ message: 'Non-working day deleted' })
  }
}
