/* eslint-disable unicorn/filename-case */
import { rules, schema } from '@adonisjs/validator'

export default class NoteValidator {
  static createSchema = schema.create({
    note: schema.string({ trim: true }, [rules.required(), rules.maxLength(255)]),
    userId: schema.number([rules.unsigned(), rules.required()]),
  })

  static updateSchema = schema.create({
    note: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    userId: schema.number.optional([rules.unsigned()]),
  })

  static messages = {
    'note.required': 'Note is required',
    'note.maxLength': 'Note cannot be longer than 255 characters',
    'userId.required': 'User ID is required',
    'userId.unsigned': 'User ID must be a positive number',
  }
}
