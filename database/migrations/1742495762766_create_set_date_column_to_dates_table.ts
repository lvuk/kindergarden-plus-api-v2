import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_activities'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('date').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('date').alter()
    })
  }
}
