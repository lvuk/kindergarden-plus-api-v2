/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'

export default class NonWorkingDayValidator {
  public static createSchema = schema.create({
    day: schema.date({ format: 'dd-MM-yyyy' }, [rules.required()]),
    kindergardenId: schema.number([rules.required(), rules.unsigned()]),
  })

  public static updateSchema = schema.create({
    day: schema.date.optional({ format: 'dd-MM-yyyy' }),
    kindergardenId: schema.number.optional([rules.unsigned()]),
  })

  public static messages = {
    'day.required': 'Day is required',
    'date.required': 'Date is required',
    'kindergardenId.required': 'Kindergarden ID is required',
    'kindergardenId.unsigned': 'Kindergarden ID must be a positive number',
  }
}
