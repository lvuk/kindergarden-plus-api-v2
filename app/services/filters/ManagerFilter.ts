/* eslint-disable unicorn/filename-case */
import User from '#models/user'

export default class ManagerFitler {
  static apply(query: any, user: User) {
    // Assuming a manager should only see records from their kindergarden
    return query.where('kindergarden_id', user.kindergardenId)
  }
}
