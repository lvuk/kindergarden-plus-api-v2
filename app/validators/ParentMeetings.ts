/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'

export default class ParentMeetingValidator {
  public static createSchema = schema.create({
    pedagogicalDocumentId: schema.number([rules.unsigned(), rules.required()]),
    preparation: schema.string.optional([rules.maxLength(255)]),
    meetingSummary: schema.string.optional([rules.maxLength(255)]),
    notes: schema.string.optional([rules.maxLength(255)]),
  })

  public static updateSchema = schema.create({
    pedagogicalDocumentId: schema.number.optional([rules.unsigned()]),
    preparation: schema.string.optional([rules.maxLength(255)]),
    meetingSummary: schema.string.optional([rules.maxLength(255)]),
    notes: schema.string.optional([rules.maxLength(255)]),
  })

  public static messages = {
    'pedagogicalDocumentId.required': 'Pedagogical document ID is required',
    'pedagogicalDocumentId.unsigned': 'Pedagogical document ID must be a positive number',
    'preparation.maxLength': 'Preparation cannot be longer than 255 characters',
    'meetingSummary.maxLength': 'Meeting summary cannot be longer than 255 characters',
    'notes.maxLength': 'Notes cannot be longer than 255 characters',
  }
}
