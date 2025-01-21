const { views } = require('govuk-prototype-kit')

function timeNow(string) {
  const timeNow = new Date()
  const formatter = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short' })
  return formatter.format(timeNow)
}

function dateNow(string) {
  const dateNow = new Date()
  const formatter = new Intl.DateTimeFormat('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })
  return formatter.format(dateNow)
}

module.exports = {
  timeNow,
  dateNow
}

views.addFilter('timeNow', timeNow)
views.addFilter('dateNow', dateNow)
