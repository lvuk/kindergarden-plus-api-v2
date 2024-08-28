import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'development_tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pedagogical_document_id')
        .unsigned()
        .references('id')
        .inTable('pedagogical_documents')
        .onDelete('CASCADE')
      table.string('for_group')
      table.string('for_individual')
      table.string('development_field')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
