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
const ChildrenController = () => import('#controllers/children_controller')
const WorkingdaysController = () => import('#controllers/workingdays_controller')
const NonWorkingDaysController = () => import('#controllers/nonworkingdays_controller')
const EventsController = () => import('#controllers/events_controller')
const ResourceController = () => import('#controllers/resources_controller')
const WeeklyPlanController = () => import('#controllers/weekly_plans_controller')
const PedagogicalDocumentsController = () => import('#controllers/pedagogical_documents_controller')
const DevelopmentTasksController = () => import('#controllers/development_tasks_controller')
const WorkLogsController = () => import('#controllers/work_logs_controller')
const ParentMeetingsController = () => import('#controllers/parent_meetings_controller')
const AttendanceController = () => import('#controllers/attendances_controller')
const NotesController = () => import('#controllers/notes_controller')
const PhotosController = () => import('#controllers/photos_controller')
const DailyActivitiesController = () => import('#controllers/daily_activities_controller')
const PaymentsController = () => import('#controllers/payments_controller')

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
        response.json({ error: 'Test', message: 'This is a test message' })
      })
      .as('api.test')

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

    //groups
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

    //children
    router
      .group(() => {
        router.get('/', [ChildrenController, 'index']).as('api.children.index')
        router.get('/:id', [ChildrenController, 'show']).as('api.children.show') //ako je roditelj moze samo svoje dete
        router
          .put('/:id', [ChildrenController, 'update'])
          .as('api.children.update')
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

        router
          .group(() => {
            router.post('/', [ChildrenController, 'store']).as('api.children.store')
            router.delete('/:id', [ChildrenController, 'destroy']).as('api.children.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER]))
      })
      .prefix('children')
      .use(middleware.auth())

    router
      .get('/parents/:parentId/children', [ChildrenController, 'getChildrenFromParent'])
      .as('api.children.childrenFromParent')
      .use(middleware.auth())

    //working days
    router
      .group(() => {
        router.get('/', [WorkingdaysController, 'index']).as('api.workingdays.index')
        router.get('/:id', [WorkingdaysController, 'show']).as('api.workingdays.show')

        router
          .group(() => {
            router.post('/', [WorkingdaysController, 'store']).as('api.workingdays.store')
            router
              .put('/:id', [WorkingdaysController, 'update'])
              .as('api.workingdays.update')
              .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

            router.delete('/:id', [WorkingdaysController, 'destroy']).as('api.workingdays.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER]))
      })
      .prefix('workingdays')
      .use(middleware.auth())

    //non working days
    router
      .group(() => {
        router.get('/', [NonWorkingDaysController, 'index']).as('api.nonworkingdays.index')
        router.get('/:id', [NonWorkingDaysController, 'show']).as('api.nonworkingdays.show')

        router
          .group(() => {
            router.post('/', [NonWorkingDaysController, 'store']).as('api.nonworkingdays.store')
            router
              .put('/:id', [NonWorkingDaysController, 'update'])
              .as('api.nonworkingdays.update')
              .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

            router
              .delete('/:id', [NonWorkingDaysController, 'destroy'])
              .as('api.nonworkingdays.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER]))
      })
      .prefix('nonworkingdays')
      .use(middleware.auth())

    //events
    router
      .group(() => {
        router.get('/', [EventsController, 'index']).as('api.events.index') //svi
        router.get('/:id', [EventsController, 'show']).as('api.events.show') //svi

        router
          .group(() => {
            router.post('/', [EventsController, 'store']).as('api.events.store') //manager //admin //teacher
            router.put('/:id', [EventsController, 'update']).as('api.events.update')
            router.delete('/:id', [EventsController, 'destroy']).as('api.events.destroy') //admin manager teacher
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))
      })
      .prefix('events')
      .use(middleware.auth())

    //resources
    router
      .group(() => {
        router.get('/', [ResourceController, 'index']).as('api.resources.index')
        router.get('/:id', [ResourceController, 'show']).as('api.resources.show')

        router
          .group(() => {
            router.post('/', [ResourceController, 'store']).as('api.resources.store')
            router.put('/:id', [ResourceController, 'update']).as('api.resources.update')
            router.delete('/:id', [ResourceController, 'destroy']).as('api.resources.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN]))
      })
      .prefix('resources')
      .use(middleware.auth())

    //weekly plans
    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [WeeklyPlanController, 'index']).as('api.weekly_plans.index')
            router.get('/:id', [WeeklyPlanController, 'show']).as('api.weekly_plans.show')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

        router
          .group(() => {
            router.post('/', [WeeklyPlanController, 'store']).as('api.weekly_plans.store')
            router.put('/:id', [WeeklyPlanController, 'update']).as('api.weekly_plans.update')
            router.delete('/:id', [WeeklyPlanController, 'destroy']).as('api.weekly_plans.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.TEACHER]))
      })
      .prefix('weekly-plans')
      .use(middleware.auth())

    //pedagogical documents
    router
      .group(() => {
        router
          .group(() => {
            router
              .get('/', [PedagogicalDocumentsController, 'index'])
              .as('api.pedagogical-documents.index')
            router
              .get('/:id', [PedagogicalDocumentsController, 'show'])
              .as('api.pedagogical-documents.show')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

        router
          .group(() => {
            router
              .post('/', [PedagogicalDocumentsController, 'store'])
              .as('api.pedagogical-documents.store')
            router
              .put('/:id', [PedagogicalDocumentsController, 'update'])
              .as('api.pedagogical-documents.update')
            router
              .delete('/:id', [PedagogicalDocumentsController, 'destroy'])
              .as('api.pedagogical-documents.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.TEACHER]))
      })
      .prefix('pedagogical-documents')
      .use(middleware.auth())

    //development tasks
    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [DevelopmentTasksController, 'index']).as('api.development-tasks.index')
            router
              .get('/:id', [DevelopmentTasksController, 'show'])
              .as('api.development-tasks.show')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

        router
          .group(() => {
            router
              .post('/', [DevelopmentTasksController, 'store'])
              .as('api.development-tasks.store')
            router
              .put('/:id', [DevelopmentTasksController, 'update'])
              .as('api.development-tasks.update')
            router
              .delete('/:id', [DevelopmentTasksController, 'destroy'])
              .as('api.development-tasks.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.TEACHER]))
      })
      .prefix('development-tasks')
      .use(middleware.auth())

    //work logs
    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [WorkLogsController, 'index']).as('api.work-logs.index')
            router.get('/:id', [WorkLogsController, 'show']).as('api.work-logs.show')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.TEACHER]))

        router
          .group(() => {
            router.post('/', [WorkLogsController, 'store']).as('api.work-logs.store')
            router.put('/:id', [WorkLogsController, 'update']).as('api.work-logs.update')
            router.delete('/:id', [WorkLogsController, 'destroy']).as('api.work-logs.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.TEACHER]))
      })
      .prefix('work-logs')
      .use(middleware.auth())

    //parent meetings
    router
      .group(() => {
        router.get('/', [ParentMeetingsController, 'index']).as('api.parent-meetings.index')
        router.get('/:id', [ParentMeetingsController, 'show']).as('api.parent-meetings.show')

        router
          .group(() => {
            router.post('/', [ParentMeetingsController, 'store']).as('api.parent-meetings.store')
            router
              .put('/:id', [ParentMeetingsController, 'update'])
              .as('api.parent-meetings.update')
            router
              .delete('/:id', [ParentMeetingsController, 'destroy'])
              .as('api.parent-meetings.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.TEACHER]))
      })
      .prefix('parent-meetings')
      .use(middleware.auth())
      .use(middleware.checkRole([Role.ADMIN, Role.TEACHER, Role.MANAGER]))

    //Attendance
    router
      .group(() => {
        router.get('/', [AttendanceController, 'index']).as('api.attendances.index')
        router.get('/:id', [AttendanceController, 'show']).as('api.attendances.show')

        router
          .group(() => {
            router.post('/', [AttendanceController, 'store']).as('api.attendances.store')
            router.put('/:id', [AttendanceController, 'update']).as('api.attendances.update')
            router.delete('/:id', [AttendanceController, 'destroy']).as('api.attendances.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.TEACHER]))
      })
      .prefix('attendances')
      .use(middleware.auth())
      .use(middleware.checkRole([Role.ADMIN, Role.TEACHER, Role.MANAGER]))

    //notes
    router
      .group(() => {
        router.post('/', [NotesController, 'store']).as('api.notes.store')
        router.get('/', [NotesController, 'index']).as('api.notes.index')
        router.get('/:id', [NotesController, 'show']).as('api.notes.show')
        router.put('/:id', [NotesController, 'update']).as('api.notes.update')
        router.delete('/:id', [NotesController, 'destroy']).as('api.notes.destroy')
      })
      .prefix('notes')
      .use(middleware.auth())

    //daily activity
    router
      .group(() => {
        router
          .group(() => {
            router.post('/', [DailyActivitiesController, 'store']).as('api.daily-activities.store')
            router
              .put('/:id', [DailyActivitiesController, 'update'])
              .as('api.daily-activities.update')
            router
              .delete('/:id', [DailyActivitiesController, 'destroy'])
              .as('api.daily-activities.destroy')
          })
          .use(middleware.checkRole([Role.TEACHER, Role.ADMIN]))
          .prefix('daily-activities')

        router
          .get('/groups/:groupId/daily-activities', [DailyActivitiesController, 'index'])
          .as('api.daily-activities.index')
        router
          .get('/daily-activities/:id', [DailyActivitiesController, 'show'])
          .as('api.daily-activities.show')
      })
      .use(middleware.auth())

    //photos
    router
      .group(() => {
        router
          .group(() => {
            router.post('/', [PhotosController, 'store']).as('api.photos.store')
            // router.put('/:id', [PhotosController, 'update']).as('api.photos.update')
            router.delete('/:id', [PhotosController, 'destroy']).as('api.photos.destroy')
          })
          .prefix('photos')
          .use(middleware.checkRole([Role.TEACHER, Role.ADMIN]))

        router.get('/groups/:groupId/photos', [PhotosController, 'index']).as('api.photos.index')
        router.get('/photos/:id', [PhotosController, 'show']).as('api.photos.show')
      })
      .use(middleware.auth())

    //payments
    router
      .group(() => {
        router
          .post('/', [PaymentsController, 'store'])
          .as('api.payments.store')
          .use(middleware.checkRole([Role.PARENT]))

        router
          .group(() => {
            router.get('/', [PaymentsController, 'index']).as('api.payments.index')
            router.get('/:id', [PaymentsController, 'show']).as('api.payments.show')
            router.put('/:id/pay', [PaymentsController, 'pay']).as('api.payments.pay')
            router.delete('/:id', [PaymentsController, 'destroy']).as('api.payments.destroy')
          })
          .use(middleware.checkRole([Role.ADMIN, Role.MANAGER, Role.PARENT]))
      })
      .use(middleware.auth())
      .prefix('payments')
  })
  .prefix('api/v1')
