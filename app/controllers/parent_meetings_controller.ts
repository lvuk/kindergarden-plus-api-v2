import ParentMeetingValidator from '#validators/ParentMeetings'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import PedagogicalDocument from '#models/pedagogical_documentation/pedagogical_document'
import ParentMeeting from '#models/parent_meeting'

export default class ParentMeetingsController {
  //display all parent meetings
  async index({ auth, response }: HttpContext) {
    var parentMeetings: ParentMeeting[]

    switch (auth.user!.role) {
      case Role.TEACHER:
        parentMeetings = await ParentMeeting.query()
          .preload('pedagogicalDocument')
          .whereHas('pedagogicalDocument', (builder) => {
            builder.whereHas('teachers', (teacherBuilder) => {
              teacherBuilder.where('id', auth.user!.id)
            })
          })
        break
      case Role.MANAGER:
        parentMeetings = await ParentMeeting.query()
          .preload('pedagogicalDocument')
          .whereHas('pedagogicalDocument', (builder) => {
            builder.whereHas('kindergarden', (kindergardenBuilder) => {
              kindergardenBuilder.where('id', auth.user!.kindergardenId)
            })
          })
        break
      default:
        parentMeetings = await ParentMeeting.query().preload('pedagogicalDocument')
    }

    if (!parentMeetings)
      return response.status(404).json({ error: 'No relevant parent meetings found' })

    return response.status(200).json(parentMeetings)
  }

  //create new parent meeting
  async store({ request, auth, response }: HttpContext) {
    const data = await request.validate({
      schema: ParentMeetingValidator.createSchema,
      messages: ParentMeetingValidator.messages,
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
        error: 'You are not allowed to create parent meetings for this pedagogical document',
      })

    const parentMeeting = await ParentMeeting.create(data)

    return response.status(201).json(parentMeeting)
  }

  //show individual record
  async show({ params, auth, response }: HttpContext) {
    const parentMeeting = await ParentMeeting.query()
      .where('id', params.id)
      .preload('pedagogicalDocument')
      .first()

    if (!parentMeeting) return response.status(404).json({ error: 'Parent meeting not found' })
    if (
      auth.user!.role === Role.TEACHER &&
      !parentMeeting.pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    )
      return response.status(403).json({ error: 'You are not allowed to view this parent meeting' })

    if (
      auth.user!.role === Role.MANAGER &&
      parentMeeting.pedagogicalDocument.kindergardenId !== auth.user!.kindergardenId
    )
      return response.status(403).json({ error: 'You are not allowed to view this parent meeting' })

    return response.status(200).json(parentMeeting)
  }

  //update record
  async update({ params, request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: ParentMeetingValidator.updateSchema,
      messages: ParentMeetingValidator.messages,
    })

    const parentMeeting = await ParentMeeting.query()
      .where('id', params.id)
      .preload('pedagogicalDocument')
      .first()
    if (!parentMeeting) return response.status(404).json({ error: 'Parent meeting not found' })
    if (
      auth.user!.role === Role.TEACHER &&
      !parentMeeting.pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    ) {
      return response
        .status(403)
        .json({ error: 'You are not allowed to update this parent meeting' })
    }

    parentMeeting.merge(data)
    await parentMeeting.save()
    return response
      .status(200)
      .json({ message: 'Parent meeting updated successfully', parentMeeting })
  }

  //delete
  async destroy({ params, auth, response }: HttpContext) {
    const parentMeeting = await ParentMeeting.query()
      .where('id', params.id)
      .preload('pedagogicalDocument')
      .first()

    if (!parentMeeting) return response.status(404).json({ error: 'Parent meeting not found' })
    if (
      auth.user!.role === Role.TEACHER &&
      !parentMeeting.pedagogicalDocument.teachers.some((teacher) => teacher.id === auth.user!.id)
    ) {
      return response
        .status(403)
        .json({ error: 'You are not allowed to delete this parent meeting' })
    }

    await parentMeeting.delete()
    return response.status(200).json({ message: 'Parent meeting deleted successfully' })
  }
}
