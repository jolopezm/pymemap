import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import * as Haptics from 'expo-haptics'
import HapticPressable from '../../../components/ui/HapticPressable'
import { Text } from 'react-native'

jest.mock('expo-haptics')

describe('HapticPressable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <HapticPressable onPress={() => {}}>
        <Text>Test Content</Text>
      </HapticPressable>
    )
    expect(getByText('Test Content')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <HapticPressable onPress={onPressMock}>
        <Text>Press Me</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Press Me'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it('triggers light haptic feedback by default', () => {
    const { getByText } = render(
      <HapticPressable onPress={() => {}}>
        <Text>Press</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Press'))
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light)
  })

  it('triggers medium haptic feedback', () => {
    const { getByText } = render(
      <HapticPressable onPress={() => {}} hapticStyle="medium">
        <Text>Press</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Press'))
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium)
  })

  it('triggers heavy haptic feedback', () => {
    const { getByText } = render(
      <HapticPressable onPress={() => {}} hapticStyle="heavy">
        <Text>Press</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Press'))
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy)
  })

  it('triggers selection haptic feedback', () => {
    const { getByText } = render(
      <HapticPressable onPress={() => {}} hapticStyle="selection">
        <Text>Press</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Press'))
    expect(Haptics.selectionAsync).toHaveBeenCalled()
  })

  it('triggers success notification', () => {
    const { getByText } = render(
      <HapticPressable onPress={() => {}} hapticStyle="success">
        <Text>Press</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Press'))
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success)
  })

  it('does not trigger haptics when disabled', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <HapticPressable onPress={onPressMock} disabled>
        <Text>Disabled</Text>
      </HapticPressable>
    )
    
    fireEvent.press(getByText('Disabled'))
    expect(Haptics.impactAsync).not.toHaveBeenCalled()
    expect(onPressMock).not.toHaveBeenCalled()
  })

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 }
    const { getByText } = render(
      <HapticPressable onPress={() => {}} style={customStyle}>
        <Text>Styled</Text>
      </HapticPressable>
    )
    expect(getByText('Styled')).toBeTruthy()
  })

  it('handles function style prop', () => {
    const styleFunction = ({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })
    const { getByText } = render(
      <HapticPressable onPress={() => {}} style={styleFunction}>
        <Text>Function Style</Text>
      </HapticPressable>
    )
    expect(getByText('Function Style')).toBeTruthy()
  })
})
