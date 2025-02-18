/* eslint-disable unicorn/filename-case */
import { rules, schema } from '@adonisjs/validator'

export default class PhotosValidator {
  static createSchema = schema.create({
    url: schema.string({ trim: true }, [rules.required()]),
  })

  static messages = {
    'url.required': 'URL is required',
  }
}
