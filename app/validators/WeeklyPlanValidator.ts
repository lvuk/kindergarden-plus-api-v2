/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'

export default class WeeklyPlanValidator {
  public static createSchema = schema.create({
    pedagogicalDocumentId: schema.number([rules.unsigned(), rules.required()]),
    titleAndSequence: schema.string.optional([rules.maxLength(255)]),
    tasksForRealization: schema.string.optional([rules.maxLength(255)]),
    forOtherKids: schema.string.optional([rules.maxLength(255)]),
  })

  public static updateSchema = schema.create({
    pedagogicalDocumentationId: schema.number.optional([rules.unsigned()]),
    titleAndSequence: schema.string.optional([rules.maxLength(255)]),
    tasksForRealization: schema.string.optional([rules.maxLength(255)]),
    forOtherKids: schema.string.optional([rules.maxLength(255)]),
  })

  public static messages = {
    'pedagogicalDocumentId.required': 'Pedagogical Documentation ID is required',
    'pedagogicalDocumentId.unsigned': 'Pedagogical Documentation ID must be a positive number',
    'titleAndSequence.required': 'Title and sequence is required',
    'titleAndSequence.maxLength': 'Title and sequence cannot be longer than 255 characters',
    'tasksForRealization.required': 'Tasks for realization is required',
    'tasksForRealization.maxLength': 'Tasks for realization cannot be longer than 255 characters',
    'forOtherKids.required': 'For other kids is required',
    'forOtherKids.maxLength': 'For other kids cannot be longer than 255 characters',
  }
}
