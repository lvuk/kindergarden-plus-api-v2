import User from '#models/user'
import AttendanceValidator from '#validators/AttendanceValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import Child from '#models/child'
import Attendance from '#models/attendance'
import AttendanceService from '#services/AttendanceService'
import luxon from 'luxon'

export default class AttendancesController {
  //displat all attendance
  async index({ auth, response, request }: HttpContext) {
    const attendances = await AttendanceService.getAttendancesByRoleAndDate(
      auth.user!,
      request.qs().date
    )

    if (!attendances || attendances.length === 0) {
      return response.status(404).json({
        errors: [{ message: 'No relevant attendance records found' }],
      })
    }

    // Transform the response to include the pivot data in the children
    const transformedAttendances = attendances.map((attendance) => {
      return {
        ...attendance.$attributes,
        group: attendance.group,
        teachers: attendance.teachers,
        children: attendance.children.map((child) => {
          return {
            ...child.$attributes,
            isPresent: child.$extras.pivot_is_present,
            category: child.$extras.pivot_category,
          }
        }),
      }
    })

    return response.status(200).json(transformedAttendances)
  }

  //create new attendance
  async store({ request, auth, response }: HttpContext) {
    // Validate request data
    const data = await request.validate({
      schema: AttendanceValidator.createSchema,
      messages: AttendanceValidator.messages,
    })

    // Check if attendance for the specific date already exists
    const isAlreadyExisting = await Attendance.query().where('date', data.date.toISODate()!).first()
    if (isAlreadyExisting) {
      return response.status(400).json({
        errors: [{ message: `Attendance for ${data.date.toFormat('dd.MM.yyyy.')} already exists` }],
      })
    }

    // Ensure the teacher is present if the role is TEACHER
    if (auth.user!.role === Role.TEACHER && !data.teachers.includes(auth.user!)) {
      data.teachers.push(auth.user!)
    }

    // Validate the existence of the teachers
    if (data.teachers.length > 0) {
      for (const teacherData of data.teachers) {
        const teacher = await User.query().where('id', teacherData.id).first()
        if (!teacher) {
          return response
            .status(400)
            .json({ error: `Teacher with ID ${teacherData.id} doesn't exist` })
        }
        if (teacher.role !== Role.TEACHER) {
          return response
            .status(400)
            .json({ error: `User with ID ${teacherData.id} is not a teacher` })
        }
      }
    }

    // Validate the existence of children
    if (data.children.length > 0) {
      for (const childData of data.children) {
        const child = await Child.query().where('id', childData.id).first()
        if (!child) {
          return response.status(400).json({ error: `Child with ID ${childData.id} doesn't exist` })
        }
      }
    }

    // Create the attendance record
    const attendance = await Attendance.create({
      groupId: data.groupId,
      date: data.date,
      numberOfChildren: data.numberOfChildren,
    })

    // Attach teachers to the attendance
    if (data.teachers.length > 0) {
      const teacherIds = data.teachers.map((teacher) => teacher.id)
      await attendance.related('teachers').attach(teacherIds)
      await attendance.load('teachers')
    }

    // Handle attaching children with pivot data (is_present and category)
    if (data.children.length > 0) {
      const childrenPivotData: Record<
        number,
        { is_present: boolean; category: string | undefined }
      > = {}

      // Prepare the pivot data
      data.children.forEach((child) => {
        childrenPivotData[child.id] = {
          is_present: child.isPresent,
          category: child.category,
        }
      })

      // Attach the children with pivot data to the attendance
      await attendance.related('children').attach(childrenPivotData)

      // Fetch children with pivot data using a raw query
      const childrenWithPivotData = await Child.query()
        .innerJoin('child_attendances', 'children.id', 'child_attendances.child_id')
        .where('child_attendances.attendance_id', attendance.id)
        .select(
          'children.id',
          'children.first_name',
          'children.last_name',
          'child_attendances.is_present',
          'child_attendances.category'
        )

      var newChildren: { [x: string]: any }[] = []
      childrenWithPivotData.forEach((child) => {
        const newChild = {
          ...child.$attributes,
          isPresent: child.$extras.is_present,
          category: child.$extras.category,
        }
        newChildren.push(newChild)
      })

      // Return response with attendance, children with pivot data, and teachers
      return response.status(201).json({
        attendance: {
          ...attendance.$attributes,
          children: newChildren,
          teachers: attendance.teachers,
        },
      })
    }

    // If no children data, return attendance with teachers only
    return response.status(201).json({
      ...attendance.$attributes,
      teachers: attendance.teachers,
    })
  }

  //show individual record
  async show({ params, auth, response }: HttpContext) {
    const attendance = await Attendance.query()
      .where('id', params.id)
      .preload('teachers', (teachersQuery) => {
        teachersQuery.select('id', 'first_name', 'last_name')
      })
      .preload('children', (childrenQuery) => {
        childrenQuery.select('id', 'first_name', 'last_name')
        childrenQuery.pivotColumns(['is_present', 'category'])
      })
      .preload('group', (groupQuery) => {
        groupQuery.preload('kindergarden', (kindergardenQuery) => {
          kindergardenQuery.select('id', 'name')
        })
      })
      .first()

    if (!attendance) {
      return response.status(404).json({ error: 'Attendance record not found' })
    }

    if (
      auth.user!.role === Role.TEACHER &&
      !attendance.teachers.some((teacher) => teacher.id === auth.user!.id)
    ) {
      return response.status(403).json({ error: 'You are not authorized to view this attendance' })
    }

    if (auth.user!.role === Role.MANAGER && attendance.groupId !== auth.user!.groupId) {
      return response.status(403).json({ error: 'You are not authorized to view this attendance' })
    }

    // Transform the response to include the pivot data in the children
    const transformedAttendance = {
      ...attendance.$attributes,
      group: attendance.group,
      teachers: attendance.teachers,
      children: attendance.children.map((child) => {
        return {
          ...child.$attributes,
          isPresent: child.$extras.pivot_is_present, // Ensure the key is correct
          category: child.$extras.pivot_category, // Ensure the key is correct
        }
      }),
    }

    return response.status(200).json(transformedAttendance)
  }

  //update record
  async update({ params, request, response, auth }: HttpContext) {
    console.log('Received data:', request.all())
    const data = await request.validate({
      schema: AttendanceValidator.updateSchema,
      messages: AttendanceValidator.messages,
    })

    const attendance = await Attendance.query().where('id', params.id).preload('teachers').first()

    if (!attendance) {
      return response.status(404).json({ error: 'Attendance record not found' })
    }

    if (
      auth.user!.role === Role.TEACHER &&
      !attendance.teachers.some((teacher) => teacher.id === auth.user!.id)
    ) {
      return response
        .status(403)
        .json({ error: 'You are not authorized to update this attendance' })
    }

    // Update the attendance record
    attendance.merge({
      // kindergardenId: data.kindergardenId,
      // group: data.group,
      date: data.date,
      numberOfChildren: data.numberOfChildren,
    })

    await attendance.save()

    // Update teachers
    if (data.teachers) {
      await attendance.related('teachers').sync(data.teachers)
      await attendance.load('teachers')
    }

    // Update children with pivot data
    if (data.children) {
      const childrenPivotData: Record<number, { is_present?: boolean; category?: string }> = {}

      //pivot data
      data.children.forEach((child) => {
        const pivotData: { is_present?: boolean; category?: string } = {}

        if (child.hasOwnProperty('is_present')) {
          pivotData.is_present = child.is_present
        }

        if (child.hasOwnProperty('category')) {
          pivotData.category = child.category
        }

        if (Object.keys(pivotData).length > 0) {
          childrenPivotData[child.id!] = pivotData
        }
      })

      // Sync the children with updated pivot data to the attendance
      await attendance.related('children').sync(childrenPivotData)
    }

    await attendance.load('teachers')
    await attendance.load('children')

    const transformedAttendance = {
      ...attendance.$attributes,
      teachers: attendance.teachers,
      children: attendance.children.map((child) => {
        return {
          ...child.$attributes,
          isPresent: child.$extras.pivot_is_present,
          category: child.$extras.pivot_category,
        }
      }),
    }

    // Return updated attendance record
    return response.status(200).json({
      message: 'Attendance record updated successfully',
      attendance: transformedAttendance,
    })
  }

  //delete record
  async destroy({ params, auth, response }: HttpContext) {
    const attendance = await Attendance.query()
      .where('id', params.id)
      .preload('children')
      .preload('teachers')
      .first()

    if (!attendance) {
      return response.status(404).json({ error: 'Attendance record not found' })
    }

    if (
      auth.user!.role === Role.TEACHER &&
      !attendance.teachers.some((teacher) => teacher.id === auth.user!.id)
    ) {
      return response
        .status(403)
        .json({ error: 'You are not authorized to delete this attendance' })
    }

    await attendance.delete()
    return response.status(200).json({ message: 'Attendance record deleted successfully' })
  }
}
