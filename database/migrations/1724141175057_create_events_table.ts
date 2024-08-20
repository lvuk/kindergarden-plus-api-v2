import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('author_id').notNullable().unsigned().references('id').inTable('users')
      table
        .integer('kindergarden_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('kindergardens')
      table.string('title').notNullable()
      table.string('description').notNullable()
      table.dateTime('start_time').notNullable()
      table.dateTime('end_time').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
