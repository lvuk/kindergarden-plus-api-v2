/* eslint-disable unicorn/filename-case */
import User from '#models/user'

export default class FilterService {
  static filterOnKindergarden(query: any, kindergartenId: number) {
    if (kindergartenId) {
      query.where('kindergarden_id', kindergartenId)
    }
    return query
  }

  static filterOnGroup(query: any, groupId: number) {
    if (groupId) {
      query.where('group_id', groupId)
    }
    return query
  }

  static filterByRole(query: any, user: User) {
    if (user.role === 'TEACHER') {
      query.where('group_id', user.groupId) // Assume the teacher has a groupId associated with them
    } else if (user.role === 'ADMIN') {
      // Admins may have access to all records, so no additional filters
    } else if (user.role === 'MANAGER') {
      query.where('kindergarden_id', user.kindergardenId) // Assume the manager has a kindergartenId associated with them
    }
    return query
  }
}
