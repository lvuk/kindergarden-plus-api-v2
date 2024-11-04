/* eslint-disable unicorn/filename-case */
export default class AdminFilter {
  static apply(query: string) {
    // Admins have access to all records, so no filters are applied
    return query
  }
}
