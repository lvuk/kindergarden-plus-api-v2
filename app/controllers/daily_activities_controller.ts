import DailyActivity from '#models/daily_activity'
import DailyActivityValidator from '#validators/DailyActivityValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import User from '#models/user'

export default class DailyActivitiesController {
  //show all daily activities
  async index({ request, response, auth }: HttpContext) {
    // const page = request.param('page', 1)
    // const limit = 10
    var dailyActivities = []

    if (auth.user!.role === Role.PARENT) {
      const parent = await User.query()
        .where('id', auth.user!.id)
        .preload('children', (childrenQuery) => {
          childrenQuery.preload('group')
        })
        .firstOrFail()

      const groupIds = parent.children.map((child) => child.groupId)

      // dailyActivities = await DailyActivity.query().preload('author').paginate(page, limit)
      dailyActivities = await DailyActivity.query().preload('author')

      dailyActivities.filter((dailyActivity) => groupIds.includes(dailyActivity.author.groupId))
    } else if (auth.user!.role === Role.TEACHER) {
      dailyActivities = await DailyActivity.query()
        .where('author_id', auth.user!.id)
        .preload('author')
      // .paginate(page, limit)
    } else {
      // dailyActivities = await DailyActivity.query().preload('author').paginate(page, limit)
      dailyActivities = await DailyActivity.query().preload('author')
    }

    return response.status(200).json(dailyActivities)
  }

  //store new daily activity
  async store({ request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: DailyActivityValidator.createSchema,
      messages: DailyActivityValidator.messages,
    })

    const existingActivity = await DailyActivity.query()
      .whereRaw('DATE(date) = ?', [data.date.toISODate()!])
      .preload('author') // Ensure author relation is loaded
      .first()

    if (existingActivity && existingActivity.author.groupId === auth.user!.groupId) {
      return response
        .status(400)
        .json({ errors: [{ message: 'Daily activity already exists for this day' }] })
    }

    const dailyActivity = await DailyActivity.create({
      ...data,
      authorId: auth.user!.id,
    })

    console.log(dailyActivity)
    return response.status(201).json(dailyActivity)
  }

  //show individual daily activity
  async show({ params, auth, response }: HttpContext) {
    const dailyActivity = await DailyActivity.findOrFail(params.id)

    if (auth.user!.role === Role.PARENT) {
      const parent = await User.query()
        .where('id', auth.user!.id)
        .preload('children', (childrenQuery) => {
          childrenQuery.preload('group')
        })
        .firstOrFail()

      const groupIds = parent.children.map((child) => child.groupId)

      if (!groupIds.includes(dailyActivity.author.groupId)) {
        return response.status(403).json({ errors: [{ messages: 'Forbidden' }] })
      }
    }

    return response.status(200).json(dailyActivity)
  }

  //update daily activity
  async update({ params, request, auth, response }: HttpContext) {
    const data = await request.validate({
      schema: DailyActivityValidator.updateSchema,
      messages: DailyActivityValidator.messages,
    })

    const dailyActivity = await DailyActivity.findOrFail(params.id)
    await dailyActivity.load('author')

    if (auth.user!.role === Role.TEACHER && dailyActivity.authorId !== auth.user!.id) {
      return response.status(403).json({ error: 'You cannot edit this daily activity' })
    } else if (auth.user!.role === Role.MANAGER) {
      if (dailyActivity.author.kindergardenId !== auth.user!.kindergardenId) {
        return response.status(403).json({ error: 'You cannot edit this daily activity' })
      }
    }

    dailyActivity.merge(data)
    await dailyActivity.save()

    return response
      .status(200)
      .json({ message: 'Daily activity updated successfully', dailyActivity })
  }

  //delete daily activity
  async destroy({ params, auth, response }: HttpContext) {
    const dailyActivity = await DailyActivity.findOrFail(params.id)
    await dailyActivity.load('author')

    if (!dailyActivity) return response.status(404).json({ error: 'Daily activity not found' })

    if (auth.user!.role === Role.TEACHER && dailyActivity.authorId !== auth.user!.id) {
      return response.status(403).json({ error: 'You cannot delete this daily activity' })
    } else if (auth.user!.role === Role.MANAGER) {
      if (dailyActivity.author.kindergardenId !== auth.user!.kindergardenId) {
        return response.status(403).json({ error: 'You cannot delete this daily activity' })
      }
    }

    await dailyActivity.delete()
    return response.status(200).json({ message: 'Daily activity deleted successfully' })
  }
}
