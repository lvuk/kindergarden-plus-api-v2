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
const AuthController = () => import('#controllers/Http/auth_controller')

router
  .group(() => {
    router
      .group(() => {
        router.post('/register', [AuthController, 'register']).as('api.auth.register')
        router.post('/login', [AuthController, 'login']).as('api.auth.login')
        router.get('/logout', [AuthController, 'logout']).as('api.auth.logout')
      })
      .prefix('auth')

    router
      .get('/test', async ({ response }) => {
        console.log('proso sam middleware')
      })
      // .use(middleware.checkRole([Role.ADMIN]))
      .use(middleware.auth())
  })
  .prefix('api/v1')
