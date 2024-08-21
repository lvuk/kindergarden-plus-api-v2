/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'

export default class ResourceValidator {
  public static createSchema = schema.create({
    title: schema.string({ trim: true }, [rules.required(), rules.maxLength(255)]),
    imageUrl: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string({ trim: true }, [rules.required(), rules.maxLength(255)]),
    link: schema.string({ trim: true }, [rules.required(), rules.maxLength(255)]),
  })

  public static updateSchema = schema.create({
    title: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    imageUrl: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    link: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
  })

  public static messages = {
    'title.required': 'Title is required',
    'title.maxLength': 'Title cannot be longer than 255 characters',
    'imageUrl.maxLength': 'Image URL cannot be longer than 255 characters',
    'description.required': 'Description is required',
    'description.maxLength': 'Description cannot be longer than 255 characters',
    'link.required': 'Link is required',
    'link.maxLength': 'Link cannot be longer than 255 characters',
  }
}
