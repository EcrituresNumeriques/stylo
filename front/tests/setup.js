import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('react-router-dom')

// mock Fetch requests
globalThis.fetch = vi.fn()

afterEach(() => cleanup())
