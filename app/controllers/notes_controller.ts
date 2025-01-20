import Note from '#models/note'
import NoteValidator from '#validators/NoteValidator'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotesController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const notes = await Note.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc')

    if (notes.length === 0) return response.status(404).json({ error: 'No notes found' })

    return response.status(200).json(notes)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: NoteValidator.createSchema,
      messages: NoteValidator.messages,
    })

    const note = await Note.create({
      ...data,
      userId: auth.user!.id,
    })
    // await note.related('user').associate(auth.user!)

    return response.status(201).json(note)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const note = await Note.query().where('id', params.id).first()

    if (!note) return response.status(404).json({ error: 'Note not found' })

    return response.status(200).json(note)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: NoteValidator.updateSchema,
      messages: NoteValidator.messages,
    })

    const note = await Note.query().where('id', params.id).first()

    if (!note) return response.status(404).json({ error: 'Note not found' })

    if (note.userId !== auth.user!.id)
      return response.status(403).json({ error: 'You are not authorized to update this note' })

    note.merge(data)
    await note.save()

    return response.status(200).json(note)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth }: HttpContext) {
    const note = await Note.query().where('id', params.id).first()

    if (!note) return response.status(404).json({ error: 'Note not found' })

    if (note.userId !== auth.user!.id) {
      return response
        .status(403)
        .json({ errors: [{ message: 'No relevant attendance records found' }] })
    }

    await note.delete()

    return response.status(200).json({ message: 'Note deleted' })
  }
}
