/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import User from '#models/user'
import RegisterValidator from '#validators/RegisterValidator'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  public async register({ request, auth, response }: HttpContextContract) {
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

      // Generate token for the newly registered user
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '2h',
      })

      return response.status(200).json({
        message: 'User successfully created',
        user,
        token,
      })
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  public async login({ request, auth, response }: HttpContext) {
    const { PIN, email, password } = request.only(['PIN', 'email', 'password'])

    const user = await User.verifyCredentials(email || PIN, password)

    if (!user) {
      return response.status(400).json({ error: 'Invalid credentials' })
    }
    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '2h',
    })

    return response.status(200).json({ message: 'User successfully logged in', user, token })
  }

  public async logout({ auth, response }: HttpContext) {
    if (auth.user) {
      const token = await User.accessTokens.find(auth.user, auth.user.currentAccessToken.identifier)
      console.log(token)
      if (token) {
        await User.accessTokens.delete(auth.user, token.identifier)
        return response.status(200).json({ message: 'User successfully logged out' })
      }
    }
  }
}
