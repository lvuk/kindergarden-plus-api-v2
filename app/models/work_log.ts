/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import PedagogicalDocument from './pedagogical_documentation/pedagogical_document.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class WorkLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedagogicalDocumentId: number

  @column()
  declare plannedIncentives: string

  @column()
  declare usedSituationalIncentives: string

  @column()
  declare observationsChildrensActivitiesAndBehavior: string

  @column()
  declare cooperationWithExpertsAndParents: string

  @column.date()
  declare date: DateTime

  @column()
  declare numberOfChildren: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PedagogicalDocument)
  declare pedagogicalDocument: BelongsTo<typeof PedagogicalDocument>

  @manyToMany(() => User, {
    pivotTable: 'work_log_teachers',
    pivotForeignKey: 'work_log_id',
    pivotRelatedForeignKey: 'teacher_id',
    pivotColumns: ['start_time', 'end_time'],
  })
  declare teachers: ManyToMany<typeof User>
}
