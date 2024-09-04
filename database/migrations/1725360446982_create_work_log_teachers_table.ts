import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'work_log_teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('work_log_id')
        .unsigned()
        .references('id')
        .inTable('work_logs')
        .onDelete('CASCADE')
      table.integer('teacher_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.datetime('start_time').notNullable()
      table.datetime('end_time').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
