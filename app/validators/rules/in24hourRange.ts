/* eslint-disable unicorn/filename-case */
import { validator } from '@adonisjs/validator'

// Define the custom validation rule for HH:mm format
validator.rule('timeIn24HourRange', (value, _, options) => {
  // Regular expression for 24-hour time format (HH:mm)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

  if (typeof value !== 'string' || !timeRegex.test(value)) {
    options.errorReporter.report(
      options.pointer,
      'timeIn24HourRange',
      'Time must be in the 24-hour format (HH:mm)',
      options.arrayExpressionPointer
    )
  }
})
