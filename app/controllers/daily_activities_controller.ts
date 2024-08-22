import DailyActivityValidator from '#validators/DailyActivityValidator'
import type { HttpContext } from '@adonisjs/core/http'

export default class DailyActivitiesController {
  //show all daily activities
  async index({}: HttpContext) {}

  //store new daily activity
  async store({ request }: HttpContext) {
    const data = await request.validate({
      schema: DailyActivityValidator.createSchema,
      messages: DailyActivityValidator.messages,
    })
  }

  //show individual daily activity
  async show({ params }: HttpContext) {}

  //update daily activity
  async update({ params, request }: HttpContext) {}

  //delete daily activity
  async destroy({ params }: HttpContext) {}
}
