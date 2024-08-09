/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Group from './group.js'

export default class Child extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare groupId: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare PIN: string

  @column()
  declare imageUrl: string

  @column.date()
  declare birthDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'parent_children',
    pivotForeignKey: 'child_id',
    pivotRelatedForeignKey: 'parent_id',
  })
  public parents!: ManyToMany<typeof User>

  @belongsTo(() => Group)
  public group!: BelongsTo<typeof Group>
}
// notes Notes[]
