import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import WeeklyPlan from './weekly_plan.js'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { Quarter } from '../../enums/quarter.js'
import Kindergarden from '#models/kindergarden'
import DevelopmentTask from './development_task.js'

export default class PedagogicalDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kindergardenId: number

  @column()
  declare managerId: number

  @column()
  declare group: string

  @column()
  declare year: string

  @column()
  declare quarter: Quarter

  @column()
  declare conditionsForCompletion: string

  @column()
  declare activitiesForCompletion: string

  @column()
  declare cooperationExpertsParents: string

  @column()
  declare jointActivities: string

  @column()
  declare observations: string

  @column()
  declare conditionsEvaluation: string

  @column()
  declare activitiesEvaluation: string

  @column()
  declare dates: string

  @column()
  declare notes: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Kindergarden)
  declare kindergarden: BelongsTo<typeof Kindergarden>

  @hasOne(() => WeeklyPlan)
  declare weeklyPlan: HasOne<typeof WeeklyPlan>

  @hasMany(() => DevelopmentTask)
  declare developmentTasks: HasMany<typeof DevelopmentTask>

  @manyToMany(() => User, {
    pivotTable: 'pedagogical_documentation_teachers',
    pivotForeignKey: 'pedagogical_document_id',
    pivotRelatedForeignKey: 'teacher_id',
  })
  declare teachers: ManyToMany<typeof User>
}
