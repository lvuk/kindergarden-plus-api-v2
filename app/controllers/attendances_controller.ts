import User from '#models/user'
import AttendanceValidator from '#validators/AttendanceValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import Child from '#models/child'
import Attendance from '#models/attendance'

export default class AttendancesController {
  //displat all attendance
  async index({ auth, response }: HttpContext) {
    let attendances: Attendance[]

    switch (auth.user!.role) {
      case Role.TEACHER:
        attendances = await Attendance.query()
          .preload('teachers', (teachersQuery) => {
            teachersQuery.select('id', 'first_name', 'last_name')
          })
          .preload('children', (childrenQuery) => {
            childrenQuery.select('id', 'first_name', 'last_name')
            childrenQuery.pivotColumns(['is_present', 'category']) // Load pivot columns
          })
          .whereHas('teachers', (builder) => {
            builder.where('id', auth.user!.id)
          })
        break
      case Role.MANAGER:
        attendances = await Attendance.query()
          .preload('teachers', (teachersQuery) => {
            teachersQuery.select('id', 'first_name', 'last_name')
          })
          .preload('children', (childrenQuery) => {
            childrenQuery.select('id', 'first_name', 'last_name')
            childrenQuery.pivotColumns(['is_present', 'category']) // Load pivot columns
          })
          .where('kindergardenId', auth.user!.kindergardenId)
        break
      default:
        attendances = await Attendance.query()
          .preload('teachers')
          .preload('children', (childrenQuery) => {
            // childrenQuery.select('id', 'first_name', 'last_name')
            childrenQuery.pivotColumns(['is_present', 'category']) // Load pivot columns
          })
    }

    if (!attendances || attendances.length === 0) {
      return response.status(404).json({ error: 'No relevant attendance records found' })
    }

    // Transform the response to include the pivot data in the children
    const transformedAttendances = attendances.map((attendance) => {
      return {
        ...attendance.$attributes,
        teachers: attendance.teachers,
        children: attendance.children.map((child) => {
          return {
            ...child.$attributes,
            isPresent: child.$extras.pivot_is_present, // Ensure the key is correct
            category: child.$extras.pivot_category, // Ensure the key is correct
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
      return response
        .status(400)
        .json({ error: `Attendance for ${data.date.toISODate()} already exists` })
    }

    // Ensure the teacher is present if the role is TEACHER
    if (auth.user!.role === Role.TEACHER && !data.teachers.includes(auth.user!.id)) {
      data.teachers.push(auth.user!.id)
    }

    // Validate the existence of the teachers
    if (data.teachers.length > 0) {
      for (const id of data.teachers) {
        const teacher = await User.query().where('id', id).first()
        if (!teacher) {
          return response.status(400).json({ error: `Teacher with ID ${id} doesn't exist` })
        }
        if (teacher.role !== Role.TEACHER) {
          return response.status(400).json({ error: `User with ID ${id} is not a teacher` })
        }
      }
    }

    // Validate the existence of children
    if (data.children.length > 0) {
      for (const childData of data.children) {
        const child = await Child.query().where('id', childData.child_id).first()
        if (!child) {
          return response
            .status(400)
            .json({ error: `Child with ID ${childData.child_id} doesn't exist` })
        }
      }
    }

    // Create the attendance record
    const attendance = await Attendance.create({
      kindergardenId: data.kindergardenId,
      group: data.group,
      date: data.date,
      numberOfChildren: data.numberOfChildren,
    })

    // Attach teachers to the attendance
    if (data.teachers.length > 0) {
      await attendance.related('teachers').attach(data.teachers)
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
        childrenPivotData[child.child_id] = {
          is_present: child.is_present,
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
        const newChild = { ...child.$attributes, ...child.$extras }
        newChildren.push(newChild)
      })

      console.log(newChildren)

      // Return response with attendance, children with pivot data, and teachers
      return response.status(201).json({
        ...attendance.$attributes,
        children: newChildren,
        teachers: attendance.teachers,
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
        childrenQuery.pivotColumns(['is_present', 'category']) // Load pivot columns
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

    if (
      auth.user!.role === Role.MANAGER &&
      attendance.kindergardenId !== auth.user!.kindergardenId
    ) {
      return response.status(403).json({ error: 'You are not authorized to view this attendance' })
    }

    // Transform the response to include the pivot data in the children
    const transformedAttendance = {
      ...attendance.$attributes,
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
    const data = await request.validate({
      schema: AttendanceValidator.updateSchema,
      messages: AttendanceValidator.messages,
    })

    const attendance = await Attendance.query().where('id', params.id).first()

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
      kindergardenId: data.kindergardenId,
      group: data.group,
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

      // Prepare the pivot data
      data.children.forEach((child) => {
        const pivotData: { is_present?: boolean; category?: string } = {}

        // Check if `is_present` exists, then assign
        if (child.hasOwnProperty('is_present')) {
          pivotData.is_present = child.is_present
        }

        // Check if `category` exists, then assign
        if (child.hasOwnProperty('category')) {
          pivotData.category = child.category
        }

        // Assign the pivot data if any valid fields are present
        if (Object.keys(pivotData).length > 0) {
          childrenPivotData[child.child_id!] = pivotData
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
          isPresent: child.$extras.pivot_is_present, // Ensure the key is correct
          category: child.$extras.pivot_category, // Ensure the key is correct
        }
      }),
    }

    // Return updated attendance record
    return response
      .status(200)
      .json({ message: 'Attendance record updated successfully', transformedAttendance })
  }

  //delete record
  async destroy({ params, auth, response }: HttpContext) {
    const attendance = await Attendance.query()
      .where('id', params.id)
      .preload('children')
      .preload('children')
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
