import WeeklyPlan from '#models/pedagogical_documentation/weekly_plan'
import WeeklyPlanValidator from '#validators/WeeklyPlanValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { QueryBuilder } from '@adonisjs/lucid/build/src/Orm/QueryBuilder'
import { Role } from '../enums/role.js'
import User from '#models/user'
import PedagogicalDocument from '#models/pedagogical_documentation/pedagogical_document'

export default class WeeklyPlansController {
  //display all weekly plans
  async index({ response, auth }: HttpContext) {
    var weeklyPlans: WeeklyPlan[]
    if (auth.user!.role === 'TEACHER') {
      // Step 1: Fetch all WeeklyPlans and preload teachers
      weeklyPlans = await WeeklyPlan.query()
        .preload('teachers') // Preload teachers for each WeeklyPlan
        .preload('pedagogicalDocumentation') // Optionally preload related documentation

      // Step 2: Filter in memory to include only those where the authenticated user is among the teachers
      weeklyPlans = weeklyPlans.filter((weeklyPlan) => {
        return weeklyPlan.teachers.some((teacher) => teacher.id === auth.user!.id)
      })
    } else if (auth.user!.role === 'MANAGER') {
      // Fetch WeeklyPlans associated with the manager's kindergarden
      weeklyPlans = await WeeklyPlan.query().preload(
        'pedagogicalDocumentation',
        (pedagogicalDocumentationQuery) => {
          pedagogicalDocumentationQuery.where('kindergardenId', auth.user!.kindergardenId)
        }
      )
    } else {
      // Fetch all WeeklyPlans
      weeklyPlans = await WeeklyPlan.query()
    }

    return response.status(200).json(weeklyPlans)
  }

  //create new weekly plan
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: WeeklyPlanValidator.createSchema,
      messages: WeeklyPlanValidator.messages,
    })

    if (data.teachers && data.teachers.length > 0) {
      data.teachers.forEach(async (id) => {
        const teacher = await User.query().where('id', id).first()
        if (!teacher)
          return response.status(400).json({ message: `Teacher with ID ${id} doesn't exists` })

        if (teacher.role !== Role.TEACHER)
          return response.status(400).json({ message: `User with ID ${id} is not a teacher` })
      })
    }

    const pedagogicalDocument = await PedagogicalDocument.query()
      .where('id', data.pedagogicalDocumentId)
      .preload('weeklyPlan')
      .firstOrFail()

    if (pedagogicalDocument.weeklyPlan)
      return response
        .status(400)
        .json({ message: 'Pedagogical document already has a weekly plan' })

    const weeklyPlan = await WeeklyPlan.create(data)

    // Attach teachers to the weekly plan
    await weeklyPlan.related('teachers').attach(data.teachers!)

    // Load the teachers relationship to include it in the response
    await weeklyPlan.load('teachers')

    // Return the created weekly plan with associated teachers
    return response.status(201).json(weeklyPlan)
  }

  //display single weekly plan
  async show({ params, response, auth }: HttpContext) {
    const weeklyPlan = await WeeklyPlan.query()
      .where('id', params.id)
      .preload('teachers')
      .preload('pedagogicalDocument')
      .first()

    if (!weeklyPlan) {
      return response.status(404).json({ message: 'Weekly plan not found' })
    }

    if (
      auth.user!.role === Role.TEACHER &&
      !weeklyPlan.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ message: 'Forbidden' })

    if (
      auth.user!.role === Role.MANAGER &&
      weeklyPlan.pedagogicalDocument.$attributes.kindergardenId !== auth.user!.kindergardenId
    )
      return response.status(403).json({ message: 'Forbidden' })

    return response.status(200).json(weeklyPlan)
  }

  //update weekly plan
  async update({ params, request, response, auth }: HttpContext) {
    // Validate the request data
    const data = await request.validate({
      schema: WeeklyPlanValidator.updateSchema,
      messages: WeeklyPlanValidator.messages,
    })

    // Find the weekly plan and preload teachers
    const weeklyPlan = await WeeklyPlan.query().where('id', params.id).preload('teachers').first()
    if (!weeklyPlan) return response.status(404).json({ message: 'Weekly plan not found' })

    // Check if the user has permission to update the plan
    if (
      auth.user!.role === Role.TEACHER &&
      !weeklyPlan.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ message: 'Forbidden' })

    // Update the weekly plan fields if they are provided
    weeklyPlan.merge({
      titleAndSequence: data.titleAndSequence,
      tasksForRealization: data.tasksForRealization,
      forOtherKids: data.forOtherKids,
      pedagogicalDocumentId: data.pedagogicalDocumentationId,
    })

    // Check and update the teachers relationship if provided
    if (data.teachers && data.teachers.length > 0) {
      data.teachers.forEach(async (id) => {
        const teacher = await User.query().where('id', id).first()
        if (!teacher)
          return response.status(400).json({ message: `Teacher with ID ${id} doesn't exists` })

        if (teacher.role !== Role.TEACHER)
          return response.status(400).json({ message: `User with ID ${id} is not a teacher` })
      })

      // Sync teachers (detach existing ones and attach the new ones)
      await weeklyPlan.related('teachers').sync(data.teachers)
    }

    // Save the updated weekly plan
    await weeklyPlan.save()

    // Reload the teachers relationship to include in the response
    await weeklyPlan.load('teachers')

    // Return the updated weekly plan
    return response.status(200).json({ message: 'Weekly plan updated successfully', weeklyPlan })
  }

  //delete weekly plan
  async destroy({ params, response, auth }: HttpContext) {
    const weeklyPlan = await WeeklyPlan.query().where('id', params.id).preload('teachers').first()

    if (!weeklyPlan) return response.status(404).json({ message: 'Weekly plan not found' })

    if (
      auth.user!.role === Role.TEACHER &&
      !weeklyPlan.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ message: 'Forbidden' })

    await weeklyPlan.delete()
    return response.status(200).json({ message: 'Weekly plan deleted successfully' })
  }
}
