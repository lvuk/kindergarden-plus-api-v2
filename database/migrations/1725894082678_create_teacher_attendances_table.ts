import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('teacher_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('attendance_id')
        .unsigned()
        .references('id')
        .inTable('attendances')
        .onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
