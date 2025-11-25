// Polyfill para Object.hasOwn (React 19)
if (!Object.hasOwn) {
  Object.hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }
}

if (typeof globalThis === 'undefined') {
  global.globalThis = global
}

// Polyfill process.env
if (!global.process) {
  global.process = {}
}
if (!global.process.env) {
  global.process.env = {}
}
global.process.env.EXPO_PUBLIC_API_ENV = 'test'

// Extend jest matchers
require('@testing-library/jest-native/extend-expect')

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}))

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: 'Stack',
}))

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}))

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 5,
      },
    })
  ),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    Highest: 6,
    High: 4,
    Balanced: 3,
    Low: 2,
    Lowest: 1,
  },
}))

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}))

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}))

// Mock context providers
jest.mock('./context/auth-context', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
  }),
  AuthProvider: ({ children }) => children,
}))

jest.mock('./context/location-context', () => ({
  useLocation: () => ({
    userLocation: 'Mock Location',
    userCoords: { latitude: 0, longitude: 0 },
    updateLocation: jest.fn(),
    isLoadingLocation: false,
  }),
  LocationProvider: ({ children }) => children,
}))

// Mock config/api.js to avoid process.env issues
jest.mock('./config/api', () => ({
  API_URL: 'http://localhost:8000',
  API_URLS: {
    local: 'http://localhost:8000',
    production: 'https://api.example.com',
  },
}))

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
