/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { rules, schema } from '@adonisjs/validator'

export default class DailyActivityValidator {
  public static createSchema = schema.create({
    date: schema.date({ format: 'dd-MM-yyyy' }),
    description: schema.string({ trim: true }, [rules.required(), rules.minLength(5)]),
    tags: schema.array().members(schema.string()),
  })

  public static updateSchema = schema.create({
    date: schema.date.optional(),
    description: schema.string.optional(),
    tags: schema.array.optional().members(schema.string()),
  })

  public static messages = {
    'date.required': 'Date is required',
    'description.required': 'Description is required',
    'description.minLength': 'Description should be at least 5 characters long',
    'tags.array': 'Tags should be an array',
    'tags.members': 'Tags should be strings',
  }
}
