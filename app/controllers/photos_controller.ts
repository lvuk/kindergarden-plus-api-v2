import Photo from '#models/photo'
import PhotosValidator from '#validators/PhotosValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'

export default class PhotosController {
  //show all photos za grupu
  async index({ response, auth, request }: HttpContext) {
    if (Number.isNaN(Number(request.param('groupId'))))
      return response.status(400).json({ errors: [{ message: 'Invalid group id' }] })

    if (auth.user!.groupId !== Number(request.param('groupId')) && auth.user!.role !== Role.ADMIN) {
      return response
        .status(403)
        .json({ errors: [{ message: 'You are not allowed to see this group photos' }] })
    }

    const photos = await Photo.query().where('groupId', request.param('groupId'))

    return response.status(200).json(photos)
  }

  //add new photo
  async store({ request, auth, response }: HttpContext) {
    const data = await request.validate({
      schema: PhotosValidator.createSchema,
      messages: PhotosValidator.messages,
    })

    const photo = await Photo.create({
      ...data,
      userId: auth.user!.id,
      groupId: auth.user!.groupId,
    })

    return response.status(201).json(photo)
  }

  //show photo
  async show({ params, auth, response }: HttpContext) {
    const photo = await Photo.query().where('id', params.id).first()

    if (!photo) return response.status(404).json({ errors: [{ message: 'Photo not found' }] })
    if (photo.groupId !== auth.user?.groupId && auth.user?.role !== Role.ADMIN)
      return response
        .status(403)
        .json({ errors: [{ message: 'You are not allowed to see this photo' }] })

    return response.status(200).json(photo)
  }

  async destroy({ params, request, response, auth }: HttpContext) {
    const photo = await Photo.query().where('id', params.id).first()

    if (!photo) return response.status(404).json({ errors: [{ message: 'Photo not found' }] })
    if (photo.userId !== auth.user?.id && auth.user?.role !== Role.ADMIN)
      return response
        .status(403)
        .json({ errors: [{ message: 'You are not allowed to delete this photo' }] })

    await photo.delete()

    return response.status(204).json({ message: 'Photo successfully deleted' })
  }
}
