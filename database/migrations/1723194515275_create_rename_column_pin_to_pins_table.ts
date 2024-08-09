import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'children'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.renameColumn('PIN', 'pin')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.renameColumn('pin', 'PIN')
    })
  }
}
