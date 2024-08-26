import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weekly_plan_teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Define the foreign keys
      table.integer('teacher_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('weekly_plan_id')
        .unsigned()
        .references('id')
        .inTable('weekly_plans')
        .onDelete('CASCADE')

      // Create a composite primary key using the two foreign keys
      table.primary(['teacher_id', 'weekly_plan_id'])

      table.timestamps() // Optional: for created_at and updated_at timestamps
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
