/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { schema, rules } from '@adonisjs/validator'
import { Quarter } from '../enums/quarter.js'

export default class PedagogicalDocumentValidator {
  public static createSchema = schema.create({
    kindergardenId: schema.number([rules.unsigned(), rules.required()]),
    managerId: schema.number([rules.unsigned(), rules.required()]),
    group: schema.string.optional([rules.maxLength(255)]),
    year: schema.string.optional([rules.maxLength(255)]),
    quarter: schema.enum(Object.values(Quarter)),
    conditionsForCompletion: schema.string.optional([rules.maxLength(255)]),
    activitiesForCompletion: schema.string.optional([rules.maxLength(255)]),
    cooperationExpertsParents: schema.string.optional([rules.maxLength(255)]),
    jointActivities: schema.string.optional([rules.maxLength(255)]),
    observations: schema.string.optional([rules.maxLength(255)]),
    conditionsEvaluation: schema.string.optional([rules.maxLength(255)]),
    activitiesEvaluation: schema.string.optional([rules.maxLength(255)]),
    dates: schema.string.optional([rules.maxLength(255)]),
    notes: schema.string.optional([rules.maxLength(255)]),

    teachers: schema.array.optional().members(schema.number()),
  })

  public static updateSchema = schema.create({
    kindergardenId: schema.number.optional([rules.unsigned()]),
    managerId: schema.number.optional([rules.unsigned()]),
    group: schema.string.optional([rules.maxLength(255)]),
    year: schema.string.optional([rules.maxLength(255)]),
    quarter: schema.enum.optional(Object.values(Quarter)),
    conditionsForCompletion: schema.string.optional([rules.maxLength(255)]),
    activitiesForCompletion: schema.string.optional([rules.maxLength(255)]),
    cooperationExpertsParents: schema.string.optional([rules.maxLength(255)]),
    jointActivities: schema.string.optional([rules.maxLength(255)]),
    observations: schema.string.optional([rules.maxLength(255)]),
    conditionsEvaluation: schema.string.optional([rules.maxLength(255)]),
    activitiesEvaluation: schema.string.optional([rules.maxLength(255)]),
    dates: schema.string.optional([rules.maxLength(255)]),
    notes: schema.string.optional([rules.maxLength(255)]),

    teachers: schema.array.optional().members(schema.number()),
  })

  public static messages = {
    'kindergardenId.required': 'Kindergarden ID is required',
    'kindergardenId.unsigned': 'Kindergarden ID must be a positive number',
    'managerId.required': 'Manager ID is required',
    'managerId.unsigned': 'Manager ID must be a positive number',
    'group.maxLength': 'Group cannot be longer than 255 characters',
    'year.maxLength': 'Year cannot be longer than 255 characters',
    'quarter.required': 'Quarter is required',
    'conditionsForCompletion.maxLength':
      'Conditions for completion cannot be longer than 255 characters',
    'activitiesForCompletion.maxLength':
      'Activities for completion cannot be longer than 255 characters',
    'cooperationExpertsParents.maxLength':
      'Cooperation with experts and parents cannot be longer than 255 characters',
    'jointActivities.maxLength': 'Joint activities cannot be longer than 255 characters',
    'observations.maxLength': 'Observations cannot be longer than 255 characters',
    'conditionsEvaluation.maxLength': 'Conditions evaluation cannot be longer than 255 characters',
    'activitiesEvaluation.maxLength': 'Activities evaluation cannot be longer than 255 characters',
    'dates.maxLength': 'Dates cannot be longer than 255 characters',
    'notes.maxLength': 'Notes cannot be longer than 255 characters',
  }
}
