import clsx from 'clsx'
import PropTypes from 'prop-types'
import React from 'react'

export default function LanguagesIcon({ className, height = 24, width = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx('lucide', 'lucide-languages', className)}
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}

LanguagesIcon.propTypes = {
  className: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
}
