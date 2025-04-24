/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'

export default class ChildValidator {
  public static createSchema = schema.create({
    groupId: schema.number([rules.unsigned(), rules.required()]),
    firstName: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    lastName: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    PIN: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(11),
      rules.minLength(11),
    ]),
    imageUrl: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    birthDate: schema.date({
      format: 'dd.MM.yyyy',
    }),
    healthRecord: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    parents: schema
      .array([rules.minLength(1), rules.maxLength(2)])
      .members(schema.number([rules.unsigned(), rules.required()])),
  })

  public static updateSchema = schema.create({
    groupId: schema.number.optional([rules.unsigned()]),
    firstName: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    lastName: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    PIN: schema.string.optional({ trim: true }, [rules.maxLength(11), rules.minLength(11)]),
    imageUrl: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    birthDate: schema.date.optional({
      format: 'dd.MM.yyyy',
    }),
    healthRecord: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    parents: schema.array
      .optional([rules.minLength(1), rules.maxLength(2)])
      .members(schema.number([rules.unsigned(), rules.required()])),
  })

  public static messages = {
    'groupId.required': 'Group ID is required',
    'groupId.unsigned': 'Group ID must be a positive number',
    'firstName.required': 'First name is required',
    'firstName.maxLength': 'First name cannot be longer than 255 characters',
    'firstName.minLength': 'First name must be at least 2 characters long',
    'lastName.required': 'Last name is required',
    'lastName.maxLength': 'Last name cannot be longer than 255 characters',
    'lastName.minLength': 'Last name must be at least 2 characters long',
    'PIN.unique': 'PIN must be unique',
    'PIN.required': 'PIN is required',
    'PIN.maxLength': 'PIN must be exactly 11 characters long',
    'PIN.minLength': 'PIN must be exactly 11 characters long',
    'imageUrl.maxLength': 'Image URL cannot be longer than 255 characters',
    'imageUrl.minLength': 'Image URL must be at least 2 characters long',
    'birthDate.required': 'Birth date is required',
    'birthDate.format': 'Birth date must be in the format yyyy-MM-dd',
    'parents.*.required': 'Parent ID is required',
    'parents.*.unsigned': 'Parent ID must be a positive number',
    'parents.*.minLength': 'At least one parent ID is required',
  }
}
