import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Child from './child.js'

export default class Attendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kindergardenId: number

  @column()
  declare group: string

  @column.date()
  declare date: DateTime

  @column()
  declare numberOfChildren: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'teacher_attendances',
    pivotForeignKey: 'attendance_id',
    pivotRelatedForeignKey: 'teacher_id',
  })
  declare teachers: ManyToMany<typeof User>

  @manyToMany(() => Child, {
    pivotTable: 'child_attendances',
    pivotForeignKey: 'attendance_id',
    pivotRelatedForeignKey: 'child_id',
    pivotColumns: ['is_present', 'category'],
  })
  declare children: ManyToMany<typeof Child>
}
