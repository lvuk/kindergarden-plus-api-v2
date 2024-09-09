import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import PedagogicalDocument from './pedagogical_documentation/pedagogical_document.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ParentMeeting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedagogicalDocumentId: number

  @column()
  declare preparation: string

  @column()
  declare meetingSummary: string

  @column()
  declare notes: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PedagogicalDocument)
  declare pedagogicalDocument: BelongsTo<typeof PedagogicalDocument>
}
