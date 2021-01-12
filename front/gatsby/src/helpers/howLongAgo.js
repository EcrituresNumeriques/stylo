export default (timeDifference) => {
  // todo: use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
  let string
  if (timeDifference < 39 * 1000) {
    string = 'moments ago'
  } else if (timeDifference < 9 * 60 * 1000) {
    string = 'minutes ago'
  } else if (timeDifference < 10 * 60 * 1000) {
    string = '10 minutes ago'
  } else if (timeDifference < 15 * 60 * 1000) {
    string = '15 minutes ago'
  } else if (timeDifference < 20 * 60 * 1000) {
    string = '20 minutes ago'
  } else if (timeDifference < 25 * 60 * 1000) {
    string = '25 minutes ago'
  } else if (timeDifference < 30 * 60 * 1000) {
    string = '30 minutes ago'
  } else if (timeDifference < 35 * 60 * 1000) {
    string = '35 minutes ago'
  } else if (timeDifference < 40 * 60 * 1000) {
    string = '40 minutes ago'
  } else if (timeDifference < 45 * 60 * 1000) {
    string = '45 minutes ago'
  } else if (timeDifference < 50 * 60 * 1000) {
    string = '50 minutes ago'
  } else if (timeDifference < 1 * 60 * 60 * 1000) {
    string = 'an hours ago'
  } else if (timeDifference < 2 * 60 * 60 * 1000) {
    string = '2 hours ago'
  } else if (timeDifference < 3 * 60 * 60 * 1000) {
    string = '3 hours ago'
  } else if (timeDifference < 4 * 60 * 60 * 1000) {
    string = '4 hours ago'
  } else if (timeDifference < 5 * 60 * 60 * 1000) {
    string = '5 hours ago'
  } else if (timeDifference < 6 * 60 * 60 * 1000) {
    string = '6 hours ago'
  } else if (timeDifference < 7 * 60 * 60 * 1000) {
    string = '7 hours ago'
  } else if (timeDifference < 8 * 60 * 60 * 1000) {
    string = '8 hours ago'
  } else if (timeDifference < 12 * 60 * 60 * 1000) {
    string = '12 hours ago'
  } else if (timeDifference < 16 * 60 * 60 * 1000) {
    string = '16 hours ago'
  } else if (timeDifference < 1 * 24 * 60 * 60 * 1000) {
    string = 'a day ago'
  } else if (timeDifference < 2 * 24 * 60 * 60 * 1000) {
    string = '2 days ago'
  } else if (timeDifference < 3 * 24 * 60 * 60 * 1000) {
    string = '3 days ago'
  } else if (timeDifference < 4 * 24 * 60 * 60 * 1000) {
    string = '4 days ago'
  } else if (timeDifference < 5 * 24 * 60 * 60 * 1000) {
    string = '5 days ago'
  } else if (timeDifference < 6 * 24 * 60 * 60 * 1000) {
    string = '6 days ago'
  } else if (timeDifference < 4 * 7 * 24 * 60 * 60 * 1000) {
    string = 'a week ago'
  } else if (timeDifference < 4 * 7 * 24 * 60 * 60 * 1000) {
    string = '2 weeks ago'
  } else if (timeDifference < 4 * 7 * 24 * 60 * 60 * 1000) {
    string = '3 weeks ago'
  } else if (timeDifference < 4 * 7 * 24 * 60 * 60 * 1000) {
    string = '4 weeks ago'
  } else if (timeDifference < 1 * 30 * 24 * 60 * 60 * 1000) {
    string = 'a month ago'
  } else if (timeDifference < 2 * 30 * 24 * 60 * 60 * 1000) {
    string = '2 months ago'
  } else if (timeDifference < 3 * 30 * 24 * 60 * 60 * 1000) {
    string = '3 months ago'
  } else if (timeDifference < 4 * 30 * 24 * 60 * 60 * 1000) {
    string = '4 months ago'
  } else if (timeDifference < 5 * 30 * 24 * 60 * 60 * 1000) {
    string = '5 months ago'
  } else if (timeDifference < 6 * 30 * 24 * 60 * 60 * 1000) {
    string = '6 months ago'
  } else if (timeDifference < 7 * 30 * 24 * 60 * 60 * 1000) {
    string = '7 months ago'
  } else if (timeDifference < 8 * 30 * 24 * 60 * 60 * 1000) {
    string = '8 months ago'
  } else if (timeDifference < 9 * 30 * 24 * 60 * 60 * 1000) {
    string = '9 months ago'
  } else if (timeDifference < 10 * 30 * 24 * 60 * 60 * 1000) {
    string = '10 months ago'
  } else if (timeDifference < 11 * 30 * 24 * 60 * 60 * 1000) {
    string = '11 months ago'
  } else if (timeDifference < 365 * 24 * 60 * 60 * 1000) {
    string = 'a year ago'
  } else if (timeDifference < 2 * 365 * 24 * 60 * 60 * 1000) {
    string = '2 year ago'
  } else if (timeDifference < 3 * 365 * 24 * 60 * 60 * 1000) {
    string = '3 year ago'
  } else if (timeDifference < 4 * 365 * 24 * 60 * 60 * 1000) {
    string = '4 year ago'
  } else if (timeDifference < 5 * 365 * 24 * 60 * 60 * 1000) {
    string = '5 year ago'
  } else {
    string = 'A really long time ago'
  }
  return string
}
