/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'
import { Day } from '../enums/day.js'

export default class WorkingDayValidator {
  public static createSchema = schema.create({
    day: schema.enum.optional(Object.values(Day), [rules.required()]),
    date: schema.date({ format: 'dd-MM-yyyy' }, [rules.required()]),
    startTime: schema.string([rules.required(), rules.regex(/^([01]\d|2[0-3]):([0-5]\d)$/)]),
    endTime: schema.string([rules.required(), rules.regex(/^([01]\d|2[0-3]):([0-5]\d)$/)]),
    kindergardenId: schema.number([rules.required(), rules.unsigned()]),
  })

  public static updateSchema = schema.create({
    day: schema.enum.optional(Object.values(Day)),
    date: schema.date.optional({ format: 'dd-MM-yyyy' }),
    startTime: schema.string.optional([rules.regex(/^([01]\d|2[0-3]):([0-5]\d)$/)]),
    endTime: schema.string.optional([rules.regex(/^([01]\d|2[0-3]):([0-5]\d)$/)]),
    kindergardenId: schema.number.optional([rules.unsigned()]),
  })

  public static messages = {
    'day.required': 'Day is required',
    'date.required': 'Date is required',
    'startTime.required': 'Start time is required',
    'startTime.regex': 'Start time must be in HH:mm format',
    'endTime.required': 'End time is required',
    'endTime.regex': 'End time must be in HH:mm format',
    'kindergardenId.required': 'Kindergarden ID is required',
    'kindergardenId.unsigned': 'Kindergarden ID must be a positive number',
  }
}
