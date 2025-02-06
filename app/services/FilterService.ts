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
      query.where('group_id', user.groupId)
    } else if (user.role === 'MANAGER') {
      query.where('kindergarden_id', user.kindergardenId)
    }
    return query
  }
}
