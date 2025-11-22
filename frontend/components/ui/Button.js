import React from 'react'
import { Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, borderRadius, spacing, typography, shadows } from '../../styles/theme'
import HapticPressable from './HapticPressable'


export default function Button({
  children,
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) {
  // Soporte para API antigua con 'title' prop
  const content = children || title
  
  // Determinar hapticStyle según variante
  const hapticStyle = variant === 'primary' ? 'medium' : 'light'
  
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Button`],
    disabled && styles.disabled,
    style,
  ]

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ]

  return (
    <HapticPressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      hapticStyle={hapticStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : typeof content === 'string' ? (
        <Text style={textStyles}>{content}</Text>
      ) : (
        content
      )}
    </HapticPressable>
  )
}

const styles = StyleSheet.create({
  // Base
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.card,
  },

  // Variantes
  primary: {
    backgroundColor: colors.primary,
    ...shadows.subtle,
  },
  secondary: {
    backgroundColor: colors.backgroundPurple,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },

  // Tamaños
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mediumButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Estados
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },

  // Textos por variante
  primaryText: {
    color: colors.white,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  outlineText: {
    color: colors.primary,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  textText: {
    color: colors.primary,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },

  // Tamaños de texto
  smallText: {
    fontSize: typography.small.fontSize,
  },
  mediumText: {
    fontSize: typography.button.fontSize,
  },
  largeText: {
    fontSize: typography.h4.fontSize,
  },

  disabledText: {
    opacity: 0.5,
  },
})
