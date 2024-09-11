import User from '#models/user'
import AttendanceValidator from '#validators/AttendanceValidator'
import type { HttpContext } from '@adonisjs/core/http'
import { Role } from '../enums/role.js'
import Child from '#models/child'
import Attendance from '#models/attendance'
import { Database } from '@adonisjs/lucid/database'

export default class AttendancesController {
  //displat all attendance
  async index({}: HttpContext) {}

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
  async show({ params }: HttpContext) {}

  //update record
  async update({ params, request }: HttpContext) {}

  //delete record
  async destroy({ params }: HttpContext) {}
}
