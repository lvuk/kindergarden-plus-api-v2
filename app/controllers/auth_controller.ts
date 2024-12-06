/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Group from '#models/group'
import Kindergarden from '#models/kindergarden'
import User from '#models/user'
import RegisterValidator from '#validators/RegisterValidator'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  public async register({ request, auth, response }: HttpContext) {
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

      // Check if kindergardenId exists, and associate the user with a kindergarten if provided
      if (data.kindergardenId) {
        // Find the kindergarten and relate it to the user
        const kindergarden = await Kindergarden.findOrFail(data.kindergardenId) // Ensure the kindergarten exists
        await user.related('kindergarden').associate(kindergarden) // Associate the user with the kindergarten
      }

      // Check if groupId exists, and associate the user with a group if provided
      if (data.groupId) {
        const group = await Group.findOrFail(data.groupId)
        await user.related('group').associate(group)
      }

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
    var user = null
    try {
      user = await User.verifyCredentials(email || PIN, password)
    } catch (error) {
      return response.status(400).json({ errors: [{ message: error.message }] })
    }

    // const user = await User.query().where('PIN', PIN).orWhere('email', email).first()

    // if ((await User.accessTokens.all(user)).length > 0) {
    //   return response.status(400).json({ error: 'User already logged in' })
    // }

    if (!user) {
      return response.status(400).json({ error: 'Invalid credentials' })
    }
    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '30d',
    })

    response.cookie(
      'auth_token',
      { token, role: user!.role },
      {
        httpOnly: true, // Prevent access from JavaScript
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        maxAge: 100 * 60, // 2 hours
      }
    )

    await user.load('group', (query) => {
      query.preload('kindergarden')
    })
    // const { id, role } = user!
    // response.cookie('user', { id, role }, { httpOnly: false, maxAge: 100 * 60 })

    return response.status(200).json({ message: 'User successfully logged in', user, token })
  }

  public async logout({ auth, response }: HttpContext) {
    if (auth.user) {
      const token = await User.accessTokens.find(auth.user, auth.user.currentAccessToken.identifier)
      // Clear the HttpOnly cookie
      response.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
      })

      if (token) {
        await User.accessTokens.delete(auth.user, token.identifier)
        return response.status(200).json({ message: 'User successfully logged out' })
      }
    } else {
      return response.status(400).json({ error: 'You are not logged in' })
    }
  }
}
