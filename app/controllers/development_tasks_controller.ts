import PedagogicalDocument from '#models/pedagogical_documentation/pedagogical_document'
import DevelopmentTaskValidator from '#validators/DevelopmentTaskValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import DevelopmentTask from '#models/pedagogical_documentation/development_task'

export default class DevelopmentTasksController {
  //get all development tasks
  async index({ response, auth }: HttpContext) {
    var developmentTasks: DevelopmentTask[]

    switch (auth.user!.role) {
      case 'TEACHER':
        developmentTasks = await DevelopmentTask.query()
          .preload('pedagogicalDocument')
          .whereHas('pedagogicalDocument', (builder) => {
            builder.whereHas('teachers', (teacherBuilder) => {
              teacherBuilder.where('id', auth.user!.id)
            })
          })
        break
      case 'MANAGER':
        developmentTasks = await DevelopmentTask.query()
          .preload('pedagogicalDocument')
          .whereHas('pedagogicalDocument', (builder) => {
            builder.whereHas('kindergarden', (kindergardenBuilder) => {
              kindergardenBuilder.where('id', auth.user!.kindergardenId)
            })
          })
        break
      default:
        developmentTasks = await DevelopmentTask.query().preload('pedagogicalDocument')
    }

    if (!developmentTasks)
      return response.status(404).json({ error: 'No relevant development tasks found' })
    return response.status(200).json(developmentTasks)
  }

  //create new development task
  async store({ request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: DevelopmentTaskValidator.createSchema,
      messages: DevelopmentTaskValidator.messages,
    })

    const pedagogicalDocument = await PedagogicalDocument.query()
      .where('id', data.pedagogicalDocumentId)
      .preload('teachers')
      .first()

    if (!pedagogicalDocument)
      return response.status(404).json({ error: 'Pedagogical document not found' })
    if (
      auth.user!.role === Role.TEACHER &&
      !pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({
        error: 'You are not allowed to create development tasks for this pedagogical document',
      })

    const developmentTask = await DevelopmentTask.create(data)

    return response.status(201).json(developmentTask)
  }

  //show individual development task
  async show({ params, response, auth }: HttpContext) {
    const developmentTask = await DevelopmentTask.query()
      .where('id', params.id)
      .preload('pedagogicalDocument')
      .first()
    if (!developmentTask) return response.status(404).json({ error: 'Development task not found' })

    switch (auth.user!.role) {
      case 'TEACHER':
        if (
          !developmentTask.pedagogicalDocument.teachers.some(
            (teacher) => teacher.id === auth.user!.id
          )
        )
          return response
            .status(403)
            .json({ error: 'You are not allowed to view this development task' })
        break
      case 'MANAGER':
        if (developmentTask.pedagogicalDocument.kindergardenId !== auth.user!.kindergardenId)
          return response
            .status(403)
            .json({ error: 'You are not allowed to view this development task' })
        break
      default:
        break
    }

    return response.status(200).json(developmentTask)
  }

  //update development task
  async update({ params, request }: HttpContext) {}

  //delete development task
  async destroy({ params }: HttpContext) {}
}
