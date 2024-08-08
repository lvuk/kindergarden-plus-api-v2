/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kindergardens'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('postal_code').notNullable()
      table.string('city').notNullable()
      table.string('country').notNullable()
      table.string('phone_number').notNullable()
      table.string('email').notNullable()
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('postal_code')
      table.dropColumn('city')
      table.dropColumn('country')
      table.dropColumn('phone_number')
      table.dropColumn('email')
    })
  }
}
