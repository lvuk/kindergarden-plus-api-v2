import { Kindergarden } from '#models/kindergarden'
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
import { Role } from '../app/enums/role.js'
const UsersController = () => import('#controllers/users_controller')
const KindergardensController = () => import('#controllers/kindergardens_controller')
const GroupsController = () => import('#controllers/groups_controller')
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

    //users
    router
      .group(() => {
        router.get('/', [UsersController, 'index']).as('api.users.index')
        router.get('/:id', [UsersController, 'show']).as('api.users.show')

        router
          .group(() => {
            router.post('/', [UsersController, 'store']).as('api.users.store')
            router.put('/:id', [UsersController, 'update']).as('api.users.update')
            router.delete('/:id', [UsersController, 'destroy']).as('api.users.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER]))
      })
      .prefix('users')
      .use(middleware.auth())

    //kindergardens
    router
      .group(() => {
        router.get('/', [KindergardensController, 'index']).as('api.kindergardens.index')
        router.get('/:id', [KindergardensController, 'show']).as('api.kindergardens.show')

        router
          .put('/:id', [KindergardensController, 'update'])
          .as('api.kindergardens.update')
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER]))

        router
          .group(() => {
            router.post('/', [KindergardensController, 'store']).as('api.kindergardens.store')
            router
              .delete('/:id', [KindergardensController, 'destroy'])
              .as('api.kindergardens.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN]))
      })
      .prefix('kindergardens')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [GroupsController, 'index']).as('api.groups.index') //svi
        router.get('/:id', [GroupsController, 'show']).as('api.groups.show') //svi

        router
          .group(() => {
            router.delete('/:id', [GroupsController, 'destroy']).as('api.groups.destroy') //manager admin
            router.post('/', [GroupsController, 'store']).as('api.groups.store') //manager admin
            router
              .put('/:id', [GroupsController, 'update'])
              .as('api.groups.update')
              .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER])) //manager admin
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER]))
      })
      .prefix('groups')
      .use(middleware.auth())

    // router
    //   .get('/test', async ({ response }) => {
    //     return response.json({ message: 'Hello world' })
    //   })
    //   // .use(middleware.checkRole([Role.ADMIN]))
    //   .use(middleware.auth())
  })
  .prefix('api/v1')
