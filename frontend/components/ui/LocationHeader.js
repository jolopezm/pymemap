import { Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography } from '../../styles/theme'


export default function LocationHeader({ location, onPress }) {
  return (
    <Pressable 
      style={styles.container} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ubicación actual: ${location}`}
      accessibilityHint="Toca para cambiar tu ubicación"
    >
      <Ionicons name="location" size={18} color={colors.primary} />
      <Text style={styles.text} numberOfLines={1}>
        {location}
      </Text>
      <Ionicons name="chevron-down" size={16} color={colors.text} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
    marginRight: 4,
    flex: 1,
  },
})
