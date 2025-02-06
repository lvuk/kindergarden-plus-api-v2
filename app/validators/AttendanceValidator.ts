/* eslint-disable unicorn/filename-case */
import { rules, schema } from '@adonisjs/validator'

export default class AttendanceValidator {
  static createSchema = schema.create({
    groupId: schema.number([rules.required()]),
    date: schema.date(),
    teachers: schema.array().members(
      schema.object().members({
        id: schema.number([rules.required()]),
        firstName: schema.string.optional([rules.minLength(2), rules.maxLength(255)]),
        lastName: schema.string.optional([rules.minLength(2), rules.maxLength(255)]),
      })
    ),
    children: schema.array().members(
      schema.object().members({
        id: schema.number([rules.required()]),
        isPresent: schema.boolean([rules.required()]),
        category: schema.string.optional([rules.minLength(2), rules.maxLength(255)]),
      })
    ),
    numberOfChildren: schema.number([rules.required()]),
  })

  static updateSchema = schema.create({
    kindergardenId: schema.number.optional(),
    group: schema.string.optional(),
    date: schema.date.optional(),
    teachers: schema.array.optional().members(schema.number()),
    children: schema.array.optional().members(
      schema.object().members({
        child_id: schema.number.optional(),
        is_present: schema.boolean.optional(),
        category: schema.string.optional(),
      })
    ),
    numberOfChildren: schema.number.optional(),
  })

  static messages = {
    'groupId.required': 'Kindergarden ID is required',
    'date.required': 'Date is required',
    'teachers.array': 'Teachers should be an array',
    'teachers.members': 'Teachers should be numbers',
    'children.array': 'Children should be an array',
    'children.members': 'Children should be objects',
    'children.*.child_id.required': 'Child ID is required',
    'children.*.child_id.number': 'Child ID should be a number',
    'children.*.is_present.required': 'Is present is required',
    'children.*.is_present.boolean': 'Is present should be a boolean',
    'children.*.category.required': 'Category is required',
    'children.*.category.minLength': 'Category should be at least 2 characters long',
    'children.*.category.maxLength': 'Category should not be greater than 255 characters',
    'numberOfChildren.required': 'Number of children is required',
  }
}
