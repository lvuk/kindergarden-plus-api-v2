import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import PedagogicalDocumentation from './pedagogical_document.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class WeeklyPlan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedagogicalDocumentId: number

  @column()
  declare titleAndSequence: string

  @column()
  declare tasksForRealization: string

  @column()
  declare forOtherKids: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PedagogicalDocumentation)
  declare pedagogicalDocumentation: BelongsTo<typeof PedagogicalDocumentation>

  @manyToMany(() => User)
  declare teachers: ManyToMany<typeof User>
}
