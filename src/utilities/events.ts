import type { Form } from '@payloadcms/plugin-form-builder/types'

// Events happen in Munich; show their time there, whatever the server's zone.
const eventDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Europe/Berlin',
})

export const formatEventDate = (iso: string): string => eventDate.format(new Date(iso))

/** The name of the application-form field that carries the event. */
export const EVENT_FIELD_NAME = 'event'

/**
 * The application form with its "event" field filled in, so a submission
 * from an event page says which event it was for.
 */
export function withEventPrefilled(form: Form, eventTitle: string): Form {
  return {
    ...form,
    fields: form.fields?.map((field) =>
      'name' in field && field.name === EVENT_FIELD_NAME
        ? { ...field, defaultValue: eventTitle }
        : field,
    ),
  } as Form
}
