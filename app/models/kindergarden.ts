/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import WorkingDay from './working_day.js'
import NonWorkingDay from './non_working_day.js'
import Group from './group.js'
import PedagogicalDocument from './pedagogical_documentation/pedagogical_document.js'

export default class Kindergarden extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare postalCode: string

  @column()
  declare city: string

  @column()
  declare country: string

  @column()
  declare phoneNumber: string

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  public teachers!: HasMany<typeof User>

  @hasMany(() => WorkingDay)
  public workingDays!: HasMany<typeof WorkingDay>

  @hasMany(() => NonWorkingDay)
  public nonWorkingDays!: HasMany<typeof NonWorkingDay>

  @hasMany(() => PedagogicalDocument)
  declare pedagogicalDocuments: HasMany<typeof PedagogicalDocument>

  @hasMany(() => Group)
  public groups!: HasMany<typeof Group>
}

// event Event[]
