import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, shadows, borderRadius, spacing } from '../../styles/theme'


export default function Card({ children, style, variant = 'default', ...props }) {
  const shadowStyle = getShadowVariant(variant)
  
  return (
    <View style={[styles.card, shadowStyle, style]} {...props}>
      {children}
    </View>
  )
}

const getShadowVariant = (variant) => {
  switch (variant) {
    case 'subtle':
      return shadows.subtle
    case 'elevated':
      return shadows.elevated
    case 'strong':
      return shadows.strong
    case 'none':
      return shadows.none
    default:
      return shadows.card
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
})
