import WeeklyPlan from '#models/pedagogical_documentation/weekly_plan'
import WeeklyPlanValidator from '#validators/WeeklyPlanValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { QueryBuilder } from '@adonisjs/lucid/build/src/Orm/QueryBuilder'

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

    const weeklyPlan = await WeeklyPlan.create(data)
    return response.status(201).json(weeklyPlan)
  }

  //display single weekly plan
  async show({ params }: HttpContext) {}

  //update weekly plan
  async update({ params, request }: HttpContext) {}

  //delete weekly plan
  async destroy({ params }: HttpContext) {}
}
