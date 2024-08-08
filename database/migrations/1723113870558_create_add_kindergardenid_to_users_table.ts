import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table
        .integer('kindergarden_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('kindergardens')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('kindergarden_id')
    })
  }
}
