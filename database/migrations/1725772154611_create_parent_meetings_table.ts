import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'parent_meetings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pedagogical_document_id')
        .unsigned()
        .references('id')
        .inTable('pedagogical_documents')
        .onDelete('CASCADE')
        .onDelete('CASCADE')
      table.string('preparation')
      table.string('meeting_summary')
      table.string('notes')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
