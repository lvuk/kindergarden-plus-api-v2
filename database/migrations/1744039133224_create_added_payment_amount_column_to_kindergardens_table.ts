import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kindergardens'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('payment_amount', 10, 2).notNullable().defaultTo(0.0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_amount')
    })
  }
}
