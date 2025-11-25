import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Sistema de colores
export const colors = {
  // Primarios
  primary: '#9B59B6',
  primaryDark: '#6A4C93',
  primaryLight: '#D4B5F7',

  // Fondos
  background: '#FFFFFF',
  backgroundGray: '#FAFAFA',
  backgroundLight: '#F7F7F7',
  backgroundPurple: '#F5F0FF',

  // Textos
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#888888',
  textPlaceholder: '#999999',

  // Estados
  success: '#4CAF50',
  warning: '#F57C00',  // WCAG AA compliant (ratio 4.67:1) - antes #FF9800 (3.05:1)
  error: '#FF6B6B',
  info: '#3498db',

  // Bordes y divisores
  border: '#E8E8E8',
  divider: '#F0F0F0',

  // Sombras
  shadow: '#9B59B6',
  shadowDark: '#000000',

  // Otros
  white: '#FFFFFF',
  black: '#000000',
}

// Sistema de espaciados
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

// Border radius
export const borderRadius = {
  small: 8,
  medium: 12,
  card: 14,
  large: 16,
  xlarge: 20,
  round: 999,
}

// Sombras predefinidas
export const shadows = {
  // Sombra morada para tarjetas
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  // Sombra sutil para elementos elevados
  subtle: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  // Sombra para elementos destacados
  elevated: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  // Sombra para elementos con más énfasis
  strong: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },

  // Sin sombra
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
}

// Tipografía
export const typography = {
  // Títulos
  h1: {
    fontSize: 32,
    fontWeight: '700', // Slightly less heavy for a cleaner look
    letterSpacing: -0.8, // Tighter tracking for large text
    lineHeight: 40,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
    color: colors.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 24,
    color: colors.text,
  },

  // Cuerpo
  body: {
    fontSize: 16, // Slightly larger for better readability
    fontWeight: '400',
    lineHeight: 24, // More breathing room
    letterSpacing: 0.1,
    color: colors.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
  },

  // Subtítulos
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  },
  subtitleBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.text,
  },

  // Texto pequeño
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.textSecondary,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.text,
  },

  // Texto muy pequeño
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  smallBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text,
  },

  // Botones
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5, // Slightly wider for buttons
    textTransform: 'none', // Avoid forced uppercase if present elsewhere
  },

  // Placeholders
  placeholder: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPlaceholder,
  },
}

// Dimensiones responsivas
export const responsive = {
  // Tamaños basados en porcentaje de pantalla
  cardWidth: SCREEN_WIDTH * 0.45,
  cardImageHeight: SCREEN_WIDTH * 0.42,
  featuredSize: SCREEN_WIDTH * 0.17,
  categorySize: SCREEN_WIDTH * 0.13,

  // Pantalla completa
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  // Helpers
  wp: (percentage) => (SCREEN_WIDTH * percentage) / 100,
  hp: (percentage) => (SCREEN_HEIGHT * percentage) / 100,
}

// Estilos comunes reutilizables
export const commonStyles = {
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  // Centrado
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filas
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Tarjeta base
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadows.card,
  },

  // División
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  dividerVertical: {
    width: 1,
    backgroundColor: colors.divider,
  },

  // Textos
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
    color: colors.text,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 30,
    textAlign: 'center',
    color: colors.text,
  },

  // Inputs
  textField: {
    minHeight: 50,
    backgroundColor: colors.white,
    borderWidth: 0,
    marginBottom: spacing.lg,
    width: '100%',
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    fontSize: 16,
    ...shadows.subtle,
  },

  // Botones
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    width: '100%',
    minHeight: 54,
    ...shadows.elevated,
  },

  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },

  buttonOutline: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(51, 51, 51, 0.2)',
    borderWidth: 1.5,
  },

  buttonDisabled: {
    backgroundColor: colors.textLight,
    ...shadows.none,
  },

  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  buttonTextSecondary: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  buttonTextOutline: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },

  linkText: {
    color: colors.white,
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 40,
    ...shadows.elevated,
  },

  // Badge
  badge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
    fontSize: 12,
    textAlign: 'center',
  },
}

// Alias para compatibilidad con código existente
export const globalStyles = commonStyles

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  responsive,
  commonStyles,
  globalStyles,
}
