import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('group_id').unsigned().references('id').inTable('groups').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('group_id')
    })
  }
}
