/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { rules, schema } from '@adonisjs/validator'

export default class KindergardenValidator {
  public static createSchema = schema.create({
    name: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    address: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    postalCode: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(10),
      rules.minLength(2),
    ]),
    city: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    country: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(255),
      rules.minLength(2),
    ]),
    phoneNumber: schema.string({ trim: true }, [
      rules.required(),
      rules.maxLength(15),
      rules.minLength(6),
    ]),
    email: schema.string({ trim: true }, [rules.required(), rules.email()]),
  })

  public static updateSchema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    address: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    postalCode: schema.string.optional({ trim: true }, [rules.maxLength(10), rules.minLength(2)]),
    city: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    country: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    phoneNumber: schema.string.optional({ trim: true }, [rules.maxLength(15), rules.minLength(6)]),
    email: schema.string.optional({ trim: true }, [rules.email()]),
  })

  public static messages = {
    'name.required': 'Name is required',
    'name.maxLength': 'Name must be at most 255 characters long',
    'name.minLength': 'Name must be at least 2 characters long',
    'address.required': 'Address is required',
    'address.maxLength': 'Address must be at most 255 characters long',
    'address.minLength': 'Address must be at least 2 characters long',
    'postalCode.required': 'Postal code is required',
    'postalCode.maxLength': 'Postal code must be at most 10 characters long',
    'postalCode.minLength': 'Postal code must be at least 2 characters long',
    'city.required': 'City is required',
    'city.maxLength': 'City must be at most 255 characters long',
    'city.minLength': 'City must be at least 2 characters long',
    'country.required': 'Country is required',
    'country.maxLength': 'Country must be at most 255 characters long',
    'country.minLength': 'Country must be at least 2 characters long',
    'phoneNumber.required': 'Phone number is required',
    'phoneNumber.maxLength': 'Phone number must be at most 15 characters long',
    'phoneNumber.minLength': 'Phone number must be at least 9 characters long',
    'email.required': 'Email is required',
    'email.email': 'Email must be a valid email address',
  }
}
