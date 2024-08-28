import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedagogical_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('kindergarden_id')
        .unsigned()
        .references('id')
        .inTable('kindergardens')
        .onDelete('CASCADE')
      table.integer('manager_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      // table
      //   .integer('work_log_id')
      //   .unsigned()
      //   .references('id')
      //   .inTable('work_logs')
      //   .onDelete('CASCADE')
      table.string('group').notNullable()
      table.string('year').notNullable()
      table.enum('quarter', ['q1', 'q2', 'q3', 'q4']).notNullable()
      table.string('conditions_for_completion')
      table.string('activities_for_completion')
      table.string('cooperation_experts_parents')
      table.string('joint_activities')
      table.string('observations')
      table.string('dates')
      table.string('conditions_evaluation')
      table.string('activities_evaluation')
      table.string('notes')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
