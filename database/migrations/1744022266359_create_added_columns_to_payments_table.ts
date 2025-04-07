import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('month_paid_for').after('payment_date')
      table.boolean('is_paid').after('month_paid_for').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('month_paid_for')
      table.dropColumn('is_paid')
    })
  }
}
