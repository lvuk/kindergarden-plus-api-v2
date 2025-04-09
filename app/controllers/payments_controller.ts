import Payment from '#models/payment'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import PaymentValidator from '#validators/PaymentsValidator'
import { DateTime } from 'luxon'

export default class PaymentsController {
  async index({ auth, response }: HttpContext) {
    var payments: Payment[]

    switch (auth.user!.role) {
      case Role.ADMIN:
        payments = await Payment.query().preload('payee').preload('kindergarden')
        break
      case Role.MANAGER:
        payments = await Payment.query()
          .where('kindergardenId', auth.user!.kindergardenId)
          .preload('payee')
          .preload('kindergarden')
          .orderBy('paymentDate', 'desc')
        break
      case Role.PARENT:
        payments = await Payment.query().where('userId', auth.user!.id).preload('payee')
        break
      default:
        payments = await Payment.query()
          .where('kindergardenId', auth.user!.kindergardenId)
          .preload('payee')
          .preload('kindergarden')
    }

    return response.status(200).json(payments)
  }

  async store({ request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: PaymentValidator.createSchema,
      messages: PaymentValidator.messages,
    })

    if (!data) return response.status(400).json({ errors: [{ message: 'Invalid data' }] })

    const payment = await Payment.create({
      kindergardenId: auth.user!.kindergardenId,
      userId: auth.user!.id,
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

    if (auth.user!.role === Role.PARENT && payment.userId !== auth.user!.id) {
      return response.status(403).json({ errors: [{ message: 'Forbidden' }] })
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

    if (payment.userId !== auth.user!.id) {
      return response.unauthorized({ errors: [{ message: 'Unauthorized' }] })
    }

    if (payment.isPaid) {
      return response.badRequest({ errors: [{ message: 'Already paid' }] })
    }

    // 1. Mark current payment as paid
    payment.isPaid = true
    payment.paymentDate = DateTime.now().toJSDate()
    await payment.save()

    // 2. Check if all earlier payments are paid
    const unpaidOlder = await Payment.query()
      .where('user_id', auth.user!.id)
      .andWhere('is_paid', false)
      .andWhere('month_paid_for', '<', DateTime.fromJSDate(payment.monthPaidFor))

    if (unpaidOlder.length === 0) {
      // 3. No older unpaid payments — create the next one
      const currentMonth = DateTime.fromJSDate(payment.monthPaidFor)
      const nextMonth = currentMonth.plus({ months: 1 })

      const existing = await Payment.query()
        .where('user_id', auth.user!.id)
        .andWhere('month_paid_for', nextMonth.toISODate()!) // still works
        .first()

      if (!existing) {
        await Payment.create({
          kindergardenId: auth.user!.kindergardenId,
          userId: auth.user!.id,
          amount: payment.amount,
          paymentDate: null, // unpaid, so no date yet
          monthPaidFor: nextMonth,
          isPaid: false,
          description: `Payment for ${nextMonth.toFormat('MM/yyyy')}`,
        })
      }
    }

    return response.status(200).json({ message: 'Payment successful' })
  }
}
