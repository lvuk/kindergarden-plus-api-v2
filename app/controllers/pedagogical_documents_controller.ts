import PedagogicalDocument from '#models/pedagogical_documentation/pedagogical_document'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import PedagogicalDocumentValidator from '#validators/PedagogicalDocumentValidator'
import User from '#models/user'

export default class PedagogoicalDocumentsController {
  //display all pedagogical documents
  async index({ response, auth }: HttpContext) {
    var pedagogicalDocuments: PedagogicalDocument[]

    switch (auth.user!.role) {
      case 'TEACHER':
        pedagogicalDocuments = await PedagogicalDocument.query()
          .preload('teachers')
          .preload('kindergarden')
          .preload('weeklyPlan')
          .whereHas('teachers', (builder) => {
            builder.where('id', auth.user!.id)
          })
        break
      case 'MANAGER':
        pedagogicalDocuments = await PedagogicalDocument.query()
          .preload('kindergarden')
          .preload('weeklyPlan')
          .where('kindergardenId', auth.user!.kindergardenId)
        break
      default:
        pedagogicalDocuments = await PedagogicalDocument.query()
          .preload('kindergarden')
          .preload('weeklyPlan')
    }

    if (!pedagogicalDocuments)
      return response.status(404).json({ error: 'No relevant pedagogical documents found' })

    return response.status(200).json(pedagogicalDocuments)
  }

  //create new pedagogical document
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: PedagogicalDocumentValidator.createSchema,
      messages: PedagogicalDocumentValidator.messages,
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

    const pedagogicalDocument = await PedagogicalDocument.create(data)

    if (data.teachers) {
      await pedagogicalDocument.related('teachers').attach(data.teachers!)
      await pedagogicalDocument.load('teachers')
    }

    return response.status(201).json(pedagogicalDocument)
  }

  //show individual record
  async show({ params, response, auth }: HttpContext) {
    const pedagogicalDocument = await PedagogicalDocument.query()
      .where('id', params.id)
      .preload('kindergarden')
      .preload('teachers')
      .preload('weeklyPlan')
      .first()

    if (!pedagogicalDocument)
      return response.status(404).json({ error: 'Pedagogical document not found' })

    if (
      auth.user!.role === Role.TEACHER &&
      !pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ error: 'You are not authorized to view this document' })

    if (
      auth.user!.role === Role.MANAGER &&
      pedagogicalDocument.kindergardenId !== auth.user!.kindergardenId
    )
      return response.status(403).json({ error: 'You are not authorized to view this document' })

    return response.status(200).json(pedagogicalDocument)
  }

  //update record
  async update({ params, request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: PedagogicalDocumentValidator.updateSchema,
      messages: PedagogicalDocumentValidator.messages,
    })

    const pedagogicalDocument = await PedagogicalDocument.query()
      .where('id', params.id)
      .preload('teachers')
      .first()

    if (!pedagogicalDocument)
      return response.status(404).json({ error: 'Pedagogical document not found' })

    if (
      auth.user!.role === Role.TEACHER &&
      !pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ error: 'You are not authorized to update this document' })

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    Object.assign(pedagogicalDocument, updateData)

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
      await pedagogicalDocument.related('teachers').sync(data.teachers)
    }

    // console.log(pedagogicalDocument)

    await pedagogicalDocument.save()
    await pedagogicalDocument.load('teachers')
    await pedagogicalDocument.load('kindergarden')
    await pedagogicalDocument.load('weeklyPlan')

    return response
      .status(200)
      .json({ message: 'Pedagogical document updated successfully', pedagogicalDocument })
  }

  //delete record
  async destroy({ params, response, auth }: HttpContext) {
    const pedagogicalDocument = await PedagogicalDocument.query().where('id', params.id).first()

    if (!pedagogicalDocument)
      return response.status(404).json({ error: 'Pedagogical document not found' })

    if (
      auth.user!.role === Role.TEACHER &&
      !pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ error: 'You are not authorized to delete this document' })

    await pedagogicalDocument.delete()
    return response.status(200).json({ message: 'Pedagogical document deleted successfully' })
  }
}
