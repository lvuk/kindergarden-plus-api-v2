import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import WeeklyPlan from './weekly_plan.js'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PedagogicalDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => WeeklyPlan)
  declare weeklyPlan: HasOne<typeof WeeklyPlan>

  @manyToMany(() => User)
  declare teachers: ManyToMany<typeof User>
}
