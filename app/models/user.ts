/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { Role } from '../enums/role.js'
import Child from './child.js'
import Event from './event.js'
import Kindergarden from './kindergarden.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Group from './group.js'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import WeeklyPlan from './pedagogical_documentation/weekly_plan.js'
import PedagogicalDocumentation from './pedagogical_documentation/pedagogical_document.js'
import WorkLog from './work_log.js'
import Attendance from './attendance.js'
import Note from './note.js'
import Photo from './photo.js'
import DailyActivity from './daily_activity.js'
import Payment from './payment.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'PIN'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kindergardenId: number

  @column()
  declare groupId: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare PIN: string

  @column()
  // default!: Role.PARENT
  declare role: Role

  @column()
  declare address: string

  @column()
  declare postalCode: string

  @column()
  declare streetName: string

  @column()
  declare houseNumber: string

  @column()
  declare phoneNumber: string

  @column()
  declare customerId: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Child, {
    pivotTable: 'parent_children',
    pivotForeignKey: 'parent_id',
    pivotRelatedForeignKey: 'child_id',
  })
  public children!: ManyToMany<typeof Child>

  @belongsTo(() => Kindergarden)
  public kindergarden!: BelongsTo<typeof Kindergarden>

  @belongsTo(() => Group)
  public group!: BelongsTo<typeof Group>

  @manyToMany(() => Event, {
    pivotTable: 'event_attendees',
    pivotRelatedForeignKey: 'event_id',
    pivotForeignKey: 'attendee_id',
  })
  public events!: ManyToMany<typeof Event>

  @hasMany(() => Event)
  public ownedEvents!: HasMany<typeof Event>

  @manyToMany(() => WeeklyPlan, {
    pivotTable: 'weekly_plan_teachers',
  })
  public weeklyPlans!: ManyToMany<typeof WeeklyPlan>

  @manyToMany(() => PedagogicalDocumentation, {
    pivotTable: 'pedagogical_documentation_teachers',
  })
  public pedagogoicalDocuments!: ManyToMany<typeof PedagogicalDocumentation>

  @manyToMany(() => WorkLog, {
    pivotTable: 'work_log_teachers',
    pivotForeignKey: 'teacher_id',
    pivotRelatedForeignKey: 'work_log_id',
  })
  declare workLogs: ManyToMany<typeof WorkLog>

  @manyToMany(() => Attendance, {
    pivotTable: 'teacher_attendances',
    pivotForeignKey: 'teacher_id',
    pivotRelatedForeignKey: 'attendance_id',
  })
  declare attendances: ManyToMany<typeof Attendance>

  @hasMany(() => Note)
  declare notes: HasMany<typeof Note>

  @hasMany(() => Photo)
  declare photos: HasMany<typeof Photo>

  @hasMany(() => DailyActivity)
  declare dailyActivities: HasMany<typeof DailyActivity>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}

// notes Notes[]
