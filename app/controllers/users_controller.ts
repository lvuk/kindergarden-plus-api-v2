import Kindergarden from '#models/kindergarden'
import User from '#models/user'
import FilterService from '#services/FilterService'
import RegisterValidator from '#validators/RegisterValidator'
import UpdateUserValidator from '#validators/UpdateUserValidator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  //List all users
  async index({ request, response, auth }: HttpContext) {
    const page = request.param('page', 1)
    const limit = 10
    let query = User.query()

    query = FilterService.filterByRole(query, auth.user!)

    const users = await query.paginate(page, limit)

    if (users.isEmpty) {
      return response.status(404).json({ error: 'No users to show' })
    }

    return response.status(200).json(users)
  }

  //create new user
  async store({ request, response }: HttpContext) {
    const { PIN, email } = request.only(['PIN', 'email'])

    const checkUserExistence = async (field: string, value: string) => {
      const existingUser = await User.findBy(field, value)
      if (existingUser) {
        throw new Error(`User with that ${field} already exists`)
      }
    }

    try {
      await checkUserExistence('PIN', PIN)
      await checkUserExistence('email', email)

      const data = await request.validate({
        schema: RegisterValidator.schema,
        messages: RegisterValidator.messages,
      })

      const user = await User.create(data)

      return response.status(200).json({ message: 'User successfully created', user })
    } catch (error) {
      return response.status(400).json({ error: error.messages.errors[0].message })
    }
  }

  //show user
  async show({ request, response }: HttpContext) {
    const user = await User.find(request.param('id'))

    if (!user) return response.status(404).json({ error: 'User not found' })

    return response.status(200).json(user)
  }

  //edit user
  async update({ response, params, request }: HttpContext) {
    const user = await User.query().where('id', params.id).first()

    if (!user) return response.status(404).json({ error: 'User not found' })

    const payload = await request.validate({
      schema: UpdateUserValidator.schema,
      messages: UpdateUserValidator.messages,
    })

    if (payload.kindergardenId) {
      const kindergarden = await Kindergarden.query().where('id', payload.kindergardenId).first()
      if (!kindergarden)
        return response
          .status(404)
          .json({ error: `Kindergarden with id: ${payload.kindergardenId} doesn't exists` })
    }

    user.merge(payload)
    await user.save()
    return response.status(200).json({ message: 'User successfully updated', user })
  }

  //delete user
  async destroy({ params, response }: HttpContext) {
    const user = await User.query().where('id', params.id).first()

    if (!user) return response.status(404).json({ error: 'User not found' })

    await user.delete()
    return response.status(200).json({ message: 'User successfully deleted' })
  }
}
