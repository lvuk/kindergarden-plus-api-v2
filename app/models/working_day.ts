/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { Day } from '../enums/day.js'
import Kindergarden from './kindergarden.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class WorkingDay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kindergardenId: number

  @column()
  declare day: Day

  @column.date()
  declare date: DateTime

  @column()
  declare startTime: string

  @column()
  declare endTime: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Kindergarden)
  public kindergarden!: BelongsTo<typeof Kindergarden>
}
