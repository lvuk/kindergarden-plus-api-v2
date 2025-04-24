/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Kindergarden from './kindergarden.js'
import Child from './child.js'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kindergardenId: number

  @column()
  declare childId: number

  @column({
    serialize: (value: any) => Number(value),
  })
  declare amount: number

  @column()
  declare paymentDate: DateTime | null

  @column()
  declare monthPaidFor: DateTime

  @column()
  declare isPaid: boolean

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Child)
  public payee!: BelongsTo<typeof Child>

  @belongsTo(() => Kindergarden)
  public kindergarden!: BelongsTo<typeof Kindergarden>
}
