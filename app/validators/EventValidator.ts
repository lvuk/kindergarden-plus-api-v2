/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'

export default class EventValidator {
  public static createSchema = schema.create({
    title: schema.string({ trim: true }, [rules.required(), rules.maxLength(255)]),
    description: schema.string({ trim: true }, [rules.required(), rules.maxLength(255)]),
    startTime: schema.date({
      format: 'dd-MM-yyyy HH:mm:ss',
    }),
    endTime: schema.date({
      format: 'dd-MM-yyyy HH:mm:ss',
    }),
    attendees: schema.array.optional().members(schema.number([rules.unsigned()])),
  })

  public static updateSchema = schema.create({
    // authorId: schema.number.optional([rules.unsigned()]),
    kindergardenId: schema.number.optional([rules.unsigned()]),
    title: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    startTime: schema.date.optional({
      format: 'dd-MM-yyyy HH:mm:ss',
    }),
    endTime: schema.date.optional({
      format: 'dd-MM-yyyy HH:mm:ss',
    }),
  })

  public static messages = {
    'authorId.required': 'Author ID is required',
    'authorId.unsigned': 'Author ID must be a positive number',
    'kindergardenId.required': 'Kindergarden ID is required',
    'kindergardenId.unsigned': 'Kindergarden ID must be a positive number',
    'title.required': 'Title is required',
    'title.maxLength': 'Title cannot be longer than 255 characters',
    'description.required': 'Description is required',
    'description.maxLength': 'Description cannot be longer than 255 characters',
    'startTime.required': 'Start time is required',
    'endTime.required': 'End time is required',
  }
}
