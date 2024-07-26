/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router
      .group(() => {
        router.post('/register', [AuthController, 'register']).as('api.auth.register')
        router.post('/login', [AuthController, 'login']).as('api.auth.login')
        router
          .delete('/logout', [AuthController, 'logout'])
          .as('api.auth.logout')
          .use(middleware.auth())
      })
      .prefix('auth')

    router
      .get('/test', async ({ response }) => {
        return response.json({ message: 'Hello world' })
      })
      // .use(middleware.checkRole([Role.ADMIN]))
      .use(middleware.auth())
  })
  .prefix('api/v1')
