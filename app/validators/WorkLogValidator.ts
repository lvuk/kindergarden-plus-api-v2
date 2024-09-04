/* eslint-disable unicorn/filename-case */
import { schema, rules } from '@adonisjs/validator'

/* eslint-disable @typescript-eslint/explicit-member-accessibility */

export default class WorkLogValidator {
  public static createSchema = schema.create({
    pedagogicalDocumentId: schema.number([rules.unsigned(), rules.required()]),
    plannedIncentives: schema.string.optional([rules.maxLength(255)]),
    usedSituationalIncentives: schema.string.optional([rules.maxLength(255)]),
    observationsChildrensActivitiesAndBehavior: schema.string.optional([rules.maxLength(255)]),
    cooperationWithExpertsAndParents: schema.string.optional([rules.maxLength(255)]),
    date: schema.date({ format: 'dd-MM-yyyy' }),
    teachers: schema.array().members(
      schema.object().members({
        id: schema.number(),
        startTime: schema.date({ format: 'HH:mm' }),
        endTime: schema.date({ format: 'HH:mm' }),
      })
    ),
    numberOfChildren: schema.number([rules.unsigned()]),
  })

  public static updateSchema = schema.create({
    pedagogicalDocumentId: schema.number.optional([rules.unsigned()]),
    plannedIncentives: schema.string.optional([rules.maxLength(255)]),
    usedSituationalIncentives: schema.string.optional([rules.maxLength(255)]),
    observationsChildrensActivitiesAndBehavior: schema.string.optional([rules.maxLength(255)]),
    cooperationWithExpertsAndParents: schema.string.optional([rules.maxLength(255)]),
    date: schema.date.optional({ format: 'dd-MM-yyyy' }),
    teachers: schema.array.optional().members(
      schema.object().members({
        id: schema.number(),
        startTime: schema.date.optional({ format: 'HH:mm' }),
        endTime: schema.date.optional({ format: 'HH:mm' }),
      })
    ),
    numberOfChildren: schema.number.optional([rules.unsigned()]),
  })

  public static messages = {
    'pedagogicalDocumentId.required': 'Pedagogical document ID is required',
    'pedagogicalDocumentId.unsigned': 'Pedagogical document ID must be a positive number',
    'plannedIncentives.maxLength': 'Planned incentives cannot be longer than 255 characters',
    'usedSituationalIncentives.maxLength':
      'Used situational incentives cannot be longer than 255 characters',
    'observationsChildrensActivitiesAndBehavior.maxLength':
      'Observations childrens activities and behavior cannot be longer than 255 characters',
    'cooperationWithExpertsAndParents.maxLength':
      'Cooperation with experts and parents cannot be longer than 255 characters',
    'date.format': 'Date must be in the format dd-MM-yyyy',
    'teachers.*.id': 'Teacher ID must be a positive number',
    'teachers.*.startTime.format': 'Start time must be in the format HH:mm',
    'teachers.*.endTime.format': 'End time must be in the format HH:mm',
    'numberOfChildren.unsigned': 'Number of children must be a positive number',
  }
}
