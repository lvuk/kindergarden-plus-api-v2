import User from '#models/user'
import WorkLogValidator from '#validators/WorkLogValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import WorkLog from '#models/work_log'
import { DateTime } from 'luxon'

export default class WorkLogsController {
  //display all work logs
  async index({}: HttpContext) {}

  //create new work log
  async store({ request, response }: HttpContext) {
    const data = await request.validate({
      schema: WorkLogValidator.createSchema,
      messages: WorkLogValidator.messages,
    })

    if (data.teachers && data.teachers.length > 0) {
      data.teachers.forEach(async (teacher) => {
        const tempTeacher = await User.query().where('id', teacher.id).first()
        if (!tempTeacher)
          return response
            .status(400)
            .json({ message: `Teacher with ID ${teacher.id} doesn't exists` })

        if (tempTeacher.role !== Role.TEACHER)
          return response
            .status(400)
            .json({ message: `User with ID ${teacher.id} is not a teacher` })
      })
    }
    const requestDate = DateTime.fromISO(data.date.toISODate()!)
    console.log(data.date.toISODate())
    console.log(requestDate.toFormat('yyyy-MM-dd'))

    const existingWorkLog = await WorkLog.query()
      .whereRaw('DATE(date) = ?', [data.date.toISODate()!])
      .first()

    if (existingWorkLog)
      return response.status(400).json({ message: 'Work log for this date already exists' })

    const { teachers, ...workLogData } = data
    const workLog = await WorkLog.create(workLogData)

    // Prepare teachers data for attachment
    const teachersData = teachers.reduce(
      (acc, teacher) => {
        acc[teacher.id] = {
          start_time: teacher.startTime,
          end_time: teacher.endTime,
        }
        return acc
      },
      {} as Record<number, { start_time: DateTime; end_time: DateTime }>
    )

    // Attach teachers to the work log
    await workLog.related('teachers').attach(teachersData)

    await workLog.load('teachers', (query) => {
      query.select('*', 'work_log_teachers.start_time', 'work_log_teachers.end_time')
    })
    await workLog.load('pedagogicalDocument')
    // Format the work log response
    const responseWorkLog = {
      ...workLog.toJSON(),
      teachers: workLog.teachers.map((teacher) => ({
        ...teacher.toJSON(),
        start_time: teacher.$extras.start_time,
        end_time: teacher.$extras.end_time,
      })),
    }

    return response.status(201).json(responseWorkLog)
  }

  //show individual work log
  async show({ params, response }: HttpContext) {
    // Fetch the work log entry along with teachers and pivot data
    const workLog = await WorkLog.query()
      .where('id', params.id)
      .preload('teachers', (query) => {
        query.select('*', 'work_log_teachers.start_time', 'work_log_teachers.end_time')
      })
      .preload('pedagogicalDocument')
      .firstOrFail()

    const responseWorkLog = {
      ...workLog.toJSON(),
      teachers: workLog.teachers.map((teacher) => ({
        ...teacher.toJSON(),
        start_time: teacher.$extras.start_time, // Access pivot data
        end_time: teacher.$extras.end_time, // Access pivot data
      })),
    }

    return responseWorkLog
  }

  //update work log
  async update({ params, request, response }: HttpContext) {
    // Validate the incoming request data
    const data = await request.validate({
      schema: WorkLogValidator.updateSchema,
      messages: WorkLogValidator.messages,
    })

    // Check if the work log exists
    const workLog = await WorkLog.find(params.id)
    if (!workLog) {
      return response.status(404).json({ message: 'Work log not found' })
    }

    // If teachers are provided, validate and sync them
    if (data.teachers && data.teachers.length > 0) {
      try {
        await Promise.all(
          data.teachers.map(async (teacher) => {
            const tempTeacher = await User.query().where('id', teacher.id).first()
            if (!tempTeacher || tempTeacher.role !== 'TEACHER') {
              throw new Error(`Invalid teacher ID: ${teacher.id}`)
            }
          })
        )
      } catch (error) {
        return response.status(400).json({ message: error.message })
      }

      // Prepare teachers data for synchronization
      const teachersData = data.teachers.reduce(
        (acc, teacher) => {
          acc[teacher.id] = {
            start_time: teacher.startTime,
            end_time: teacher.endTime,
          }
          return acc
        },
        {} as Record<number, { start_time: DateTime; end_time: DateTime }>
      )

      // Sync teachers to the work log
      await workLog.related('teachers').sync(teachersData)
    }

    // Update work log fields
    workLog.merge(data)
    await workLog.save()

    // Load related data
    await workLog.load('teachers', (query) => {
      query.select('*', 'work_log_teachers.start_time', 'work_log_teachers.end_time')
    })
    await workLog.load('pedagogicalDocument')

    // Format response
    const responseWorkLog = workLog.toJSON()
    responseWorkLog.teachers = workLog.teachers.map((teacher) => ({
      ...teacher.toJSON(),
      start_time: teacher.$extras.start_time,
      end_time: teacher.$extras.end_time,
    }))

    return response.status(200).json(responseWorkLog)
  }

  //delete work log
  async destroy({ params }: HttpContext) {}
}
