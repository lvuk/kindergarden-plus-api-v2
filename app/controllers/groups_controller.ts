import Group from '#models/group'
import Kindergarden from '#models/kindergarden'
import GroupValidator from '#validators/GroupValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'

export default class GroupsController {
  //list all groups of kindergarden
  async index({ request, auth, response }: HttpContext) {
    if (request.qs().kindergardenId) {
      const groups = await Group.query().where('kindergarden_id', request.qs().kindergardenId)
      return response.status(200).json(groups)
    }

    const groups = await Group.query().preload('kindergarden')

    return response.status(200).json(groups)
  }

  //create new group
  async store({ request, response }: HttpContext) {
    const { kindergardenId } = request.only(['kindergardenId'])
    const kindergarden = await Kindergarden.find(kindergardenId)

    if (!kindergarden)
      return response
        .status(404)
        .json({ error: 'Cannot assign group to non-existing kindergarden' })

    const data = await request.validate({
      schema: GroupValidator.createSchema,
      messages: GroupValidator.messages,
    })

    const group = await kindergarden.related('groups').create(data)
    await group.load('kindergarden')

    return response.status(201).json({ message: 'Group successfully created', group })
  }

  //show single group
  async show({ params, response }: HttpContext) {
    const group = await Group.find(params.id)

    if (!group) return response.status(404).json({ error: 'Group not found' })

    await group.load('kindergarden')
    await group.load('teachers', (query) => query.where('role', Role.TEACHER))
    await group.load('children')
    await group.load('attendances')

    return response.status(200).json(group)
  }

  //edit group
  async update({ params, request, response }: HttpContext) {
    const group = await Group.find(params.id)

    if (!group) return response.status(404).json({ error: 'Group not found' })

    const data = await request.validate({
      schema: GroupValidator.updateSchema,
      messages: GroupValidator.messages,
    })

    group.merge(data)
    await group.save()

    return response.status(200).json({ message: 'Group successfully updated', group })
  }

  //delete group
  async destroy({ auth, params, response }: HttpContext) {
    const group = await Group.find(params.id)

    if (!group) return response.status(404).json({ error: 'Group not found' })

    // if (auth.user!.role === Role.TEACHER) {
    //   if (auth.user!.groupId !== params.id) {
    //     return response.status(403).json({ error: 'You are not allowed to delete this group' })
    //   }
    //   await group.delete()
    //   return response.status(200).json({ message: 'Group successfully deleted' })
    // }

    await group.delete()
    return response.status(200).json({ message: 'Group successfully deleted' })
  }
}
