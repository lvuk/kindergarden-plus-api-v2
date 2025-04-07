import EventValidator from '#validators/EventValidator'
import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import { Role } from '../enums/role.js'
import User from '#models/user'
import { InvitationStatus } from '../enums/invitation_status.js'

export default class EventsController {
  //display all events
  async index({ request, auth, response }: HttpContext) {
    var events: Event[]

    switch (auth.user!.role) {
      case Role.ADMIN:
        events = await Event.query().preload('attendees')
        break
      case Role.MANAGER:
        events = await Event.query()
          .where('kindergardenId', auth.user!.kindergardenId)
          .preload('attendees')
        break
      case Role.TEACHER:
        events = await Event.query()
          .where('kindergardenId', auth.user!.kindergardenId)
          .preload('attendees')
        break
      case Role.PARENT:
        // Fetch events with attendees and include pivot columns
        events = await Event.query()
          .whereHas('attendees', (attendeeQuery) => {
            attendeeQuery.where('users.id', auth.user!.id)
          })
          .preload('attendees', (attendeeQuery) => {
            attendeeQuery
              .where('users.id', auth.user!.id) // Filter only for the authenticated parent
              .pivotColumns(['invitation_status']) // Include the status from the pivot table
          })
        break
    }

    const transformedEvents = events.map((event) => {
      return {
        ...event.$attributes,
        attendees: event.attendees.map((attendee) => ({
          ...attendee.$attributes,
          invitationStatus: attendee.$extras.pivot_invitation_status, // Ensure this key matches your DB column
        })),
      }
    })

    return response.status(200).json(transformedEvents)
  }

  //create new event
  async store({ request, response, auth }: HttpContext) {
    var attendees: User[]

    const data = await request.validate({
      schema: EventValidator.createSchema,
      messages: EventValidator.messages,
    })

    if (data.attendees === undefined)
      return response
        .status(400)
        .json({ errors: [{ message: 'Attendees cannot be added while creating an event' }] })

    const event = await Event.create({
      ...data,
      authorId: auth.user!.id,
      kindergardenId: auth.user!.kindergardenId,
    })

    const attendeeIds = data.attendees.map((attendee) => attendee.id)

    await event.related('attendees').attach(
      attendeeIds.reduce((acc: { [key: number]: { invitation_status: string } }, id) => {
        acc[id] = { invitation_status: InvitationStatus.PENDING }
        return acc
      }, {})
    )

    await event.load('attendees', (query) => {
      query.pivotColumns(['invitation_status'])
    })

    console.log(event.attendees[0])

    const transformedEvent = {
      ...event.$attributes,
      attendees: event.attendees.map((attendee) => ({
        id: attendee.$attributes.id,
        firstName: attendee.$attributes.firstName,
        lastName: attendee.$attributes.lastName,
        invitationStatus: attendee.$extras.pivot_invitation_status,
      })),
    }
    console.log(transformedEvent)
    // return
    return response.status(201).json(transformedEvent)
  }

  //show one event
  async show({ params, auth, response }: HttpContext) {
    var event: Event | null

    switch (auth.user!.role) {
      case Role.ADMIN:
        event = await Event.query().where('id', params.id).first()
        break
      case Role.MANAGER:
        event = await Event.query()
          .preload('attendees')
          .where('id', params.id)
          .where('kindergardenId', auth.user!.kindergardenId)
          .first()
        break
      case Role.TEACHER:
        event = await Event.query()
          .preload('attendees')
          .where('id', params.id)
          .where('kindergardenId', auth.user!.kindergardenId)
          .first()
        break
      case Role.PARENT:
        event = await Event.query()
          .preload('attendees', (attendeeQuery) => {
            attendeeQuery.pivotColumns(['invitation_status'])
          })
          .where('id', params.id)
          .whereHas('attendees', (attendeeQuery) => {
            attendeeQuery.where('users.id', auth.user!.id)
          })
          .first()
        break
    }

    if (!event) return response.status(404).json({ error: `Event not found` })
    console.log(event.attendees)
    const transformedEvent = {
      ...event.$attributes,
      attendees: event.attendees.map((attendee) => ({
        ...attendee.$attributes,
        invitationStatus: attendee.$extras.pivot_invitation_status,
      })),
    }
    return response.status(200).json(transformedEvent)
  }

  //update event
  async update({ params, request, response, auth }: HttpContext) {
    const data = await request.validate({
      schema: EventValidator.updateSchema,
      messages: EventValidator.messages,
    })

    const event = await Event.query().where('id', params.id).first()

    if (!event)
      return response.status(404).json({ error: `Event with ID:${params.id} does not exists` })

    if (auth.user!.role === Role.TEACHER && event.authorId !== auth.user!.id)
      return response.status(403).json({ error: 'You are not the organizator of this event' })

    if (auth.user!.role === Role.MANAGER && event.kindergardenId !== auth.user!.kindergardenId)
      return response.status(403).json({ error: 'You are not the manager of this kindergarden' })

    await event.merge(data).save()
    return response.status(200).json({ message: 'Event updated successfully', event })
  }

  //delete event
  async destroy({ params, response, auth }: HttpContext) {
    const event = await Event.query().where('id', params.id).first()

    if (!event)
      return response.status(404).json({ error: `Event with ID:${params.id} does not exists` })

    if (auth.user!.role === Role.TEACHER && event.authorId !== auth.user!.id) {
      return response.status(403).json({ error: 'You are not the organizator of this event' })
    }

    if (auth.user!.role === Role.MANAGER && event.kindergardenId !== auth.user!.kindergardenId) {
      return response.status(403).json({ error: 'You are not the manager of this kindergarden' })
    }

    await event.delete()
    return response.status(200).json({ message: 'Event successfully deleted' })
  }
}
