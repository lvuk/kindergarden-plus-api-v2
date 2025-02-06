/* eslint-disable unicorn/filename-case */
import Attendance from '#models/attendance'
import User from '#models/user'
import { Role } from '../enums/role.js'

export default class AttendanceService {
  static basicQuery() {
    return Attendance.query()
      .preload('teachers', (teachersQuery) => {
        teachersQuery.select('id', 'first_name', 'last_name')
      })
      .preload('children', (childrenQuery) => {
        childrenQuery.select('id', 'first_name', 'last_name')
        childrenQuery.pivotColumns(['is_present', 'category'])
      })
      .preload('group', (groupQuery) => {
        groupQuery.select('id', 'name')
      })
  }

  static async getAttendancesByRoleAndDate(user: User, date: string | null) {
    const query = this.basicQuery()

    if (user.role === Role.TEACHER) {
      query.whereHas('teachers', (builder) => {
        builder.where('users.id', user.id)
      })
    } else if (user.role === Role.MANAGER) {
      query.where('kindergarden_id', user.kindergardenId)
    }

    if (date) {
      query.where('date', date)
    }

    return query.orderBy('date', 'desc').exec()
  }
}
