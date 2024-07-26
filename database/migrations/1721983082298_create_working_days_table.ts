import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'working_days'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('kindergarden_id').unsigned().references('kindergardens.id').onDelete('CASCADE')
      table.string('day').notNullable()
      table.date('date').notNullable()
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
