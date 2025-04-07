/* eslint-disable unicorn/filename-case */
import { rules, schema } from '@adonisjs/validator'

export default class PaymentValidator {
  static createSchema = schema.create({
    amount: schema.number([rules.required()]),
    paymentDate: schema.date(),
    monthPaidFor: schema.date(),
    isPaid: schema.boolean.optional(),
    description: schema.string.optional([rules.minLength(2), rules.maxLength(255)]),
  })

  static updateSchema = schema.create({
    kindergardenId: schema.number.optional(),
    userId: schema.number.optional(),
    amount: schema.number.optional(),
    paymentDate: schema.date.optional(),
    monthPaidFor: schema.date.optional(),
    isPaid: schema.boolean.optional(),
    description: schema.string.optional([rules.minLength(2), rules.maxLength(255)]),
  })

  static messages = {
    'kindergardenId.required': 'Kindergarden ID is required',
    'userId.required': 'User ID is required',
    'amount.required': 'Amount is required',
    'paymentDate.required': 'Payment date is required',
    'description.minLength': 'Description should be at least 2 characters long',
    'description.maxLength': 'Description should not be greater than 255 characters',
    'monthPaidFor.required': 'Month paid for is required',
    'isPaid.required': 'Is paid is required',
  }
}
