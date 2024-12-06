import Group from '#models/group'
import User from '#models/user'
import ChildValidator from '#validators/ChildValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import Child from '#models/child'

export default class ChildrenController {
  //list all children
  async index({ response, auth }: HttpContext) {
    if (auth.user!.role === Role.MANAGER) {
      const children = await Child.query().preload('group')
      const managersKindergardenChildren = children.filter(
        (child) => child.group.kindergardenId === auth.user!.kindergardenId
      )
      return response.status(200).json(managersKindergardenChildren)
    }

    const children = await Child.query()
      .preload('group', (groupQuery) => {
        groupQuery.preload('kindergarden')
      })
      .preload('parents')
    return response.status(200).json(children)
  }

  //create new child
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: ChildValidator.createSchema,
      messages: ChildValidator.messages,
    })

    //UNIQUE PIN CHECK
    if (await Child.query().where('PIN', data.PIN).first())
      return response.status(400).json({ error: `Child with PIN: ${data.PIN} already exists` })

    const group = await Group.find(data.groupId)
    const parents = await User.findMany(data.parents)

    if (!group)
      return response.status(404).json({ error: `Group with ID: ${data.groupId} does not exists` })

    parents.forEach((parent) => {
      if (parent.role !== Role.PARENT)
        return response.status(400).json({ error: `User with ID: ${parent.id} is not a parent` })
    })

    const child = await Child.create({
      firstName: data.firstName,
      lastName: data.lastName,
      PIN: data.PIN,
      imageUrl: data.imageUrl,
      birthDate: data.birthDate,
      groupId: data.groupId,
    })
    await child.related('parents').attach(data.parents)

    child.load('parents')
    child.load('group')

    return response.status(201).json(child)
  }

  //show child
  async show({ params, response, auth }: HttpContext) {
    const child = await Child.query()
      .where('id', params.id)
      .preload('group', (groupQuery) => {
        groupQuery.preload('kindergarden')
      })
      .preload('parents')
      .first()

    //check if child exists
    if (!child)
      return response.status(404).json({ error: `Child with ID: ${params.id} does not exists` })

    //check if user is parent of the child
    if (auth.user!.role === Role.PARENT && !child.parents.includes(auth.user!)) {
      return response.status(403).json({ error: 'You are not a parent of this child' })
    }

    //check if user is manager of the kindergarden
    if (
      auth.user!.role === Role.MANAGER &&
      child.group.kindergardenId !== auth.user!.kindergardenId
    ) {
      return response.status(403).json({ error: 'You are not a manager of this kindergarden' })
    }

    return response.status(200).json(child)
  }

  //edit child
  async update({ params, request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: ChildValidator.updateSchema,
      messages: ChildValidator.messages,
    })

    const child = await Child.query()
      .where('id', params.id)
      .preload('group', (groupQuery) => {
        groupQuery.preload('kindergarden')
      })
      .first()

    //Check if child exists
    if (!child)
      return response.status(404).json({ error: `Child with ID: ${params.id} does not exists` })

    //check if manager is manager of the child's kindergarden
    if (
      auth.user!.role === Role.MANAGER &&
      child!.group.kindergardenId !== auth.user!.kindergardenId
    ) {
      return response.status(400).json({ error: "You are not manager of child's kindergarden" })
    }

    //check if teacher is teacher of the child
    if (auth.user!.role === Role.TEACHER && child!.group.id !== auth.user!.groupId) {
      return response.status(400).json({ error: 'You are not teacher of the child' })
    }

    await child.merge(data).save()

    return response.status(200).json(child)
  }

  //delete child
  async destroy({ params, response, auth }: HttpContext) {
    const child = await Child.query()
      .where('id', params.id)
      .preload('group', (groupQuery) => {
        groupQuery.preload('kindergarden')
      })
      .first()

    //check if child exists
    if (!child)
      return response.status(404).json({ error: `Child with ID: ${params.id} does not exists` })

    if (
      auth.user!.role === Role.MANAGER &&
      child.group.kindergardenId !== auth.user!.kindergardenId
    ) {
      return response.status(403).json({ error: 'You are not a manager of childs kindergarden' })
    }

    await child.delete()
    return response.status(200).json({ message: 'Child successfully deleted' })
  }

  //get children from parent
  async getChildrenFromParent({ params, response, auth }: HttpContext) {
    const parent = await User.find(params.parentId)

    if (!parent)
      return response
        .status(404)
        .json({ errors: [{ message: `Parent with ID: ${params.parentId} does not exists` }] })

    if (auth.user!.role === Role.PARENT && auth.user!.id !== parent.id) {
      return response
        .status(403)
        .json({ errors: [{ message: 'You are not a parent of this child' }] })
    }

    await parent.load('children', (query) => {
      query.preload('group') // Preloading the 'group' relationship for children
      query.preload('parents')
    })

    console.log(parent.children)
    return response.status(200).json(parent.children)
  }
}
