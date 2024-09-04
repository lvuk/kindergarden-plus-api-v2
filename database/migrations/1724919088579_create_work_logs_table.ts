import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'work_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pedagogical_document_id')
        .unsigned()
        .references('id')
        .inTable('pedagogical_documents')
        .onDelete('CASCADE')
      table.string('planned_incentives')
      table.string('used situational incentives')
      table.string('observations_childrens_ activities_and_behavior')
      table.string('cooperation_with_experts_and_parents')
      table.date('date')
      table.integer('number_of_children')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
