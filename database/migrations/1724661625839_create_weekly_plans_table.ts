import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weekly_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pedagogical_document_id')
        .unsigned()
        .references('id')
        .inTable('pedagogical_documents')
        .onDelete('CASCADE')
      table.string('title_and_sequence')
      table.string('tasks_for_realization')
      table.string('for_other_kids')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
