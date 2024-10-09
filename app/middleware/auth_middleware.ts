import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware is used to authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const { request, auth } = ctx

    // Extract token from cookie
    const user = request.cookie('auth_token')

    if (user === undefined) {
      return ctx.response.status(401).json({ error: 'Unauthorized' })
    }
    // console.log(user.role)

    if (user.token) {
      // Set the Authorization header with the token
      request.headers()['authorization'] = `Bearer ${user.token.token}`
    }

    // Authenticate using provided guards
    await auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    return next()
  }
}
