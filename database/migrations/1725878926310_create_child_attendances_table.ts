import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'child_attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('child_id').unsigned().references('id').inTable('children').onDelete('CASCADE')
      table
        .integer('attendance_id')
        .unsigned()
        .references('id')
        .inTable('attendances')
        .onDelete('CASCADE')
      table.boolean('is_present').notNullable().defaultTo(false)
      table.string('category')

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
