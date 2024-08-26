import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedagogical_documentation_teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Define the foreign keys
      table.integer('teacher_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('pedagogical_document_id')
        .unsigned()
        .references('id')
        .inTable('pedagogical_documents')
        .onDelete('CASCADE')

      // Create a composite primary key using the two foreign keys
      table.primary(['teacher_id', 'pedagogical_document_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
