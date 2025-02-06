import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Role } from '../enums/role.js'

export default class CheckRoleMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, allowedRoles: Role[]) {
    await auth.use('api').authenticate()
    const user = auth.user as User

    console.log(user)

    if (!user) {
      return response.status(400).json({ message: 'You need to login first' })
    }

    if (!allowedRoles.includes(user.role)) {
      return response.unauthorized({ error: 'You are not allowed to perform this action' })
    }

    await next()
  }
}
