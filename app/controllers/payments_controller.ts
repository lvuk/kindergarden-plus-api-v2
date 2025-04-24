import Payment from '#models/payment'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import PaymentValidator from '#validators/PaymentsValidator'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class PaymentsController {
  async index({ auth, response, request }: HttpContext) {
    const date = request.input('date')

    const paymentsQuery = Payment.query()
      .preload('payee', (query) => {
        query.preload('parents')
      })
      .preload('kindergarden')

    switch (auth.user!.role) {
      case Role.ADMIN:
        break
      case Role.MANAGER:
        paymentsQuery.where('kindergardenId', auth.user!.kindergardenId)
        break
      case Role.PARENT:
        const parent = await User.query().where('id', auth.user!.id).preload('children').first()
        const childIds = parent!.children.map((child) => child.id)
        paymentsQuery.whereIn('child_id', childIds)
        break
    }

    if (date) {
      const parsedDate = DateTime.fromFormat(date, 'yyyy-MM')
      paymentsQuery.where('monthPaidFor', parsedDate.toFormat('yyyy-MM-dd'))
    }

    const payments = await paymentsQuery.orderBy('month_paid_for', 'desc')

    return response.status(200).json(payments)
  }

  async store({ request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: PaymentValidator.createSchema,
      messages: PaymentValidator.messages,
    })

    if (!data) return response.status(400).json({ errors: [{ message: 'Invalid data' }] })

    const parent = await User.query().where('id', auth.user!.id).first()

    const payment = await Payment.create({
      kindergardenId: auth.user!.kindergardenId,
      childId: parent?.children[0].id,
      amount: data.amount,
      paymentDate: data.paymentDate,
      monthPaidFor: data.monthPaidFor,
      isPaid: data.isPaid,
      description: data.description,
    })

    return response.status(201).json(payment)
  }

  async show({ params, response, auth }: HttpContext) {
    const payment = await Payment.query()
      .where('id', params.id)
      .preload('payee')
      .preload('kindergarden')
      .first()

    if (!payment) {
      return response.status(404).json({ errors: [{ message: 'Payment not found' }] })
    }

    if (auth.user!.role === Role.PARENT) {
      const parent = await User.query().where('id', auth.user!.id).preload('children').firstOrFail()

      const hasAccess = parent.children.some((child) => child.id === payment.childId)
      if (!hasAccess) {
        return response.status(403).json({ errors: [{ message: 'Forbidden' }] })
      }
    }

    if (auth.user!.role === Role.MANAGER && payment.kindergardenId !== auth.user!.kindergardenId) {
      return response.status(403).json({ errors: [{ message: 'Forbidden' }] })
    }

    return response.status(200).json(payment)
  }

  async update({ params, request, response }: HttpContext) {
    const data = await request.validate({
      schema: PaymentValidator.updateSchema,
      messages: PaymentValidator.messages,
    })

    if (!data) return response.status(400).json({ errors: [{ message: 'Invalid data' }] })

    const payment = await Payment.findOrFail(params.id)

    payment.merge({
      amount: data.amount,
      paymentDate: data.paymentDate,
      monthPaidFor: data.monthPaidFor,
      isPaid: data.isPaid,
      description: data.description,
    })

    await payment.save()

    return response.status(200).json(payment)
  }

  async destroy({ params }: HttpContext) {}

  async pay({ params, auth, response }: HttpContext) {
    const payment = await Payment.findOrFail(params.id)

    // 1. Ensure the parent has access to the child
    const parent = await User.query()
      .where('id', auth.user!.id)
      .preload('children') // assumes a many-to-many 'children' relation
      .firstOrFail()

    const hasAccess = parent.children.some((child) => child.id === payment.childId)
    if (!hasAccess) {
      return response.unauthorized({ errors: [{ message: 'Unauthorized' }] })
    }

    if (payment.isPaid) {
      return response.badRequest({ errors: [{ message: 'Already paid' }] })
    }

    // 2. Mark current payment as paid
    payment.isPaid = true
    payment.paymentDate = DateTime.now().toJSDate()
    await payment.save()

    // 3. Check if all earlier payments for the same child are paid
    const unpaidOlder = await Payment.query()
      .where('child_id', payment.childId)
      .andWhere('is_paid', false)
      .andWhere('month_paid_for', '<', DateTime.fromJSDate(payment.monthPaidFor))

    if (unpaidOlder.length === 0) {
      // 4. Create the next month's payment
      const currentMonth = DateTime.fromJSDate(payment.monthPaidFor)
      const nextMonth = currentMonth.plus({ months: 1 })

      const existing = await Payment.query()
        .where('child_id', payment.childId)
        .andWhere('month_paid_for', nextMonth.toISODate()!)
        .first()

      if (!existing) {
        await Payment.create({
          kindergardenId: payment.kindergardenId,
          childId: payment.childId,
          amount: payment.amount,
          paymentDate: null, // unpaid
          monthPaidFor: nextMonth,
          isPaid: false,
          description: `Payment for ${nextMonth.toFormat('MM/yyyy')}`,
        })
      }
    }

    return response.status(200).json({ message: 'Payment successful' })
  }
}
