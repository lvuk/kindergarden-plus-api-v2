/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { rules, schema } from '@adonisjs/validator'

export default class DevelopmentTaskValidator {
  public static createSchema = schema.create({
    forGroup: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    forIndividual: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    developmentField: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    pedagogicalDocumentId: schema.number([rules.required(), rules.unsigned()]),
  })

  public static updateSchema = schema.create({
    forGroup: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    forIndividual: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    developmentField: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    pedagogicalDocumentId: schema.number.optional([rules.unsigned()]),
  })

  public static messages = {
    'forGroup.required': 'For Group is required',
    'forGroup.maxLength': 'For Group cannot be longer than 255 characters',
    'forGroup.minLength': 'For Group must be at least 2 characters long',
    'forIndividual.required': 'For Individual is required',
    'forIndividual.maxLength': 'For Individual cannot be longer than 255 characters',
    'forIndividual.minLength': 'For Individual must be at least 2 characters long',
    'developmentField.required': 'Development Field is required',
    'developmentField.maxLength': 'Development Field cannot be longer than 255 characters',
    'developmentField.minLength': 'Development Field must be at least 2 characters long',
    'pedagogicalDocumentId.required': 'Pedagogical Document ID is required',
    'pedagogicalDocumentId.unsigned': 'Pedagogical Document ID must be a positive number',
  }
}
