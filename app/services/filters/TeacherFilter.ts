/* eslint-disable unicorn/filename-case */
import User from '#models/user'

export default class TeacherFilter {
  static apply(query: any, user: User) {
    // Assuming a teacher should only see records from their group
    return query.where('group_id', user.groupId)
  }
}
