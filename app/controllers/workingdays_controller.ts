import Kindergarden from '#models/kindergarden'
import WorkingDay from '#models/working_day'
import WorkingDayValidator from '#validators/WorkingDayValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class WorkingdaysController {
  //display all working days
  async index({ request, response }: HttpContext) {
    const kindergarden = await Kindergarden.query().where('id', request.qs().kindergardenId).first()
    if (!kindergarden)
      return response
        .status(404)
        .json({ error: `Kindergarden with ID: ${request.qs().kindergardenId} does not exists` })

    const workingDays = await WorkingDay.query().where('kindergardenId', kindergarden.id)
    return response.status(200).json(workingDays)
  }

  //create new working day
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: WorkingDayValidator.createSchema,
      messages: WorkingDayValidator.messages,
    })

    const kindergarden = await Kindergarden.find(data.kindergardenId)
    if (!kindergarden)
      return response
        .status(404)
        .json({ error: `Kindergarden with ID: ${data.kindergardenId} does not exists` })

    const workingDayExists = await WorkingDay.query()
      .where('kindergardenId', data.kindergardenId)
      .where('date', data.date.toISODate())
      .first()

    if (workingDayExists)
      return response.status(400).json({
        error: `Working day at ${data.date.toFormat('dd-MM-yyyy')} already exists for that kindergarden`,
      })

    const workingDay = await WorkingDay.create(data)

    return response.status(201).json(workingDay)
  }

  //show individual working day
  async show({ params, response }: HttpContext) {
    const workingDay = await WorkingDay.find(params.id)
    if (!workingDay)
      return response
        .status(404)
        .json({ error: `Working day with ID: ${params.id} does not exists` })

    return response.status(200).json(workingDay)
  }

  //edit working day
  async update({ params, request, response }: HttpContext) {
    const data = await request.validate({
      schema: WorkingDayValidator.updateSchema,
      messages: WorkingDayValidator.messages,
    })

    const workingDay = await WorkingDay.find(params.id)
    if (!workingDay)
      return response
        .status(404)
        .json({ error: `Working day with ID: ${params.id} does not exists` })

    workingDay.merge(data)
    await workingDay.save()

    return workingDay
  }

  //delete working day
  async destroy({ params, response }: HttpContext) {
    const workingDay = await WorkingDay.find(params.id)
    if (!workingDay)
      return response
        .status(404)
        .json({ error: `Working day with ID: ${params.id} does not exists` })

    await workingDay.delete()
    return response.status(200).json({ message: 'Working day deleted' })
  }
}
