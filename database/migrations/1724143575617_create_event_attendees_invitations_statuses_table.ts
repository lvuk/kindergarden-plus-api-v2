import { BaseSchema } from '@adonisjs/lucid/schema'
import { InvitationStatus } from '../../app/enums/invitation_status.js'

export default class extends BaseSchema {
  protected tableName = 'event_attendees'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('invitation_status').defaultTo(InvitationStatus.PENDING) // Tracks invitation status
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('invitation_status')
    })
  }
}
