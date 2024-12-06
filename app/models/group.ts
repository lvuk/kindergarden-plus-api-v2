/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Kindergarden from './kindergarden.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Child from './child.js'
import User from './user.js'
import Attendance from './attendance.js'

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare kindergardenId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Kindergarden)
  public kindergarden!: BelongsTo<typeof Kindergarden>

  @hasMany(() => Child)
  public children!: HasMany<typeof Child>

  @hasMany(() => User)
  public teachers!: HasMany<typeof User>

  @hasMany(() => Attendance)
  public attendances!: HasMany<typeof Attendance>
}
