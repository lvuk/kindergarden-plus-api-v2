/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable unicorn/filename-case */
import { schema, rules } from '@adonisjs/validator'
import { Role } from '../enums/role.js'
import Kindergarden from '#models/kindergarden'

export default class UpdateUserValidator {
  public static schema = schema.create({
    firstName: schema.string.optional({ trim: true }, [rules.maxLength(50), rules.minLength(2)]),
    lastName: schema.string.optional({ trim: true }, [rules.maxLength(50), rules.minLength(2)]),
    kindergardenId: schema.number.optional(),
    role: schema.enum.optional(Object.values(Role)),
    address: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    postalCode: schema.string.optional({ trim: true }, [rules.maxLength(10), rules.minLength(2)]),
    streetName: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    houseNumber: schema.string.optional({ trim: true }, [rules.maxLength(10), rules.minLength(1)]),
    phoneNumber: schema.string.optional({ trim: true }, [rules.maxLength(15), rules.minLength(9)]),
    customerId: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(2)]),
    email: schema.string.optional({ trim: true }, [rules.email()]),
    password: schema.string.optional({ trim: true }, [rules.maxLength(255), rules.minLength(8)]),
  })

  public static messages = {
    'firstName.required': 'First name is required',
    'firstName.maxLength': 'First name must be at most 50 characters long',
    'firstName.minLength': 'First name must be at least 2 characters long',
    'lastName.required': 'Last name is required',
    'lastName.maxLength': 'Last name must be at most 50 characters long',
    'lastName.minLength': 'Last name must be at least 2 characters long',
    'PIN.required': 'Personal identification number is required',
    'PIN.maxLength': 'Personal identification number must be 11 characters long',
    'PIN.minLength': 'Personal identification number must be 11 characters long',
    'role.enum': 'Role must be one of PARENT, EMPLOYEE, ADMIN',
    'address.required': 'Address is required',
    'address.maxLength': 'Address must be at most 255 characters long',
    'address.minLength': 'Address must be at least 2 characters long',
    'postalCode.required': 'Postal code is required',
    'postalCode.maxLength': 'Postal code must be at most 10 characters long',
    'postalCode.minLength': 'Postal code must be at least 2 characters long',
    'streetName.required': 'Street name is required',
    'streetName.maxLength': 'Street name must be at most 255 characters long',
    'streetName.minLength': 'Street name must be at least 2 characters long',
    'houseNumber.required': 'House number is required',
    'houseNumber.maxLength': 'House number must be at most 10 characters long',
    'houseNumber.minLength': 'House number must be at least 1 character long',
    'phoneNumber.required': 'Phone number is required',
    'phoneNumber.maxLength': 'Phone number must be at most 15 characters long',
    'phoneNumber.minLength': 'Phone number must be at least 9 characters long',
    'customerId.maxLength': 'Customer ID must be at most 255 characters long',
    'customerId.minLength': 'Customer ID must be at least 2 characters long',
    'email.required': 'Email is required',
    'email.email': 'Email must be a valid email address',
    'password.required': 'Password is required',
    'password.maxLength': 'Password must be at most 255 characters long',
    'password.minLength': 'Password must be at least 8 characters long',
  }
}
