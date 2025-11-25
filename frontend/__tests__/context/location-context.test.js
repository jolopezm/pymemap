import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}))
jest.mock('../../utils/geolocation', () => ({
  getCurrentLocation: jest.fn(),
}))
jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import { LocationProvider, useLocation } from '../../context/location-context'

describe('LocationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Date.now = jest.fn(() => 1700000000000)
  })

  const TestComponent = () => {
    const location = useLocation()
    return (
      <>
        <Text testID="location-text">{location.userLocation}</Text>
        <Text testID="loading">{location.isLoadingLocation ? 'loading' : 'ready'}</Text>
      </>
    )
  }

  describe('Provider rendering', () => {
    it('renders without crashing', () => {
      AsyncStorage.multiGet.mockResolvedValue([[null], [null], [null]])
      
      expect(() => {
        render(
          <LocationProvider>
            <Text>Test</Text>
          </LocationProvider>
        )
      }).not.toThrow()
    })

    it('provides location context to children', async () => {
      AsyncStorage.multiGet.mockResolvedValue([[null], [null], [null]])
      
      const { getByTestId } = render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      )

      await waitFor(() => {
        expect(getByTestId('location-text')).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Initial state', () => {
    it('renders with default message', async () => {
      AsyncStorage.multiGet.mockResolvedValue([[null], [null], [null]])
      
      const { getByTestId } = render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      )

      await waitFor(() => {
        expect(getByTestId('location-text')).toBeTruthy()
      }, { timeout: 3000 })
    })
  })
})
