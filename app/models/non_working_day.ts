/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Kindergarden from './kindergarden.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class NonWorkingDay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({
    serialize(value: DateTime | null) {
      return value ? value.toFormat('dd-MM-yyyy') : ''
    },
  })
  declare day: DateTime

  @column()
  declare kindergardenId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Kindergarden)
  public kindergarden!: BelongsTo<typeof Kindergarden>
}
