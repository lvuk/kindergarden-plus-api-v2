import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'child'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('group_id').unsigned().references('groups.id').onDelete('CASCADE')
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('PIN').notNullable()
      table.string('image_url').notNullable()
      table.date('birth_date').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
