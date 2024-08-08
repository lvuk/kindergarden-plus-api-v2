/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { rules, schema } from '@adonisjs/validator'

export default class GroupValidator {
  public static createSchema = schema.create({
    name: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    kindergardenId: schema.number([rules.required(), rules.unsigned()]),
  })

  public static updateSchema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    kindergardenId: schema.number.optional([rules.unsigned()]),
  })

  public static messages = {
    'name.required': 'Name is required',
    'name.maxLength': 'Name cannot be longer than 255 characters',
    'name.minLength': 'Name must be at least 2 characters long',
    'kindergarden_id.required': 'Kindergarden ID is required',
    'kindergarden_id.unsigned': 'Kindergarden ID must be a positive number',
  }
}
