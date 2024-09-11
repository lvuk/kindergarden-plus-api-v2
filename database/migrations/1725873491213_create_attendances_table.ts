import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('kindergarden_id')
        .unsigned()
        .references('id')
        .inTable('kindergardens')
        .onDelete('CASCADE')
      table.string('group').notNullable()
      table.date('date').notNullable()
      table.integer('number_of_children').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
