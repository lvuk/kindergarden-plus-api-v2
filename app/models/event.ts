import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare authorId: number

  @column()
  declare kindergardenId: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column.dateTime()
  declare startTime: DateTime

  @column.dateTime()
  declare endTime: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'event_attendees',
    pivotRelatedForeignKey: 'attendee_id',
  })
  declare attendees: ManyToMany<typeof User>

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>
}
