import React from 'react'
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DismissKeyboard from './dismiss-keyboard'

export default function Screen({
    children,
    scroll = true,
    contentContainerStyle,
    maxWidth,
    dismissKeyboard = true,
}) {
    const { width, height } = Dimensions.get('window')
    const isTablet = Math.min(width, height) >= 600
    const resolvedMaxWidth = maxWidth ?? (isTablet ? 720 : undefined)

    const Container = scroll ? ScrollView : View
    const containerProps = scroll
        ? {
              contentContainerStyle: [
                  { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 16 },
                  contentContainerStyle,
              ],
              keyboardShouldPersistTaps: 'handled',
          }
        : {
              style: [
                  { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
                  contentContainerStyle,
              ],
          }

    // Wrapper para dismiss keyboard mejorado
    const Wrapper = dismissKeyboard ? DismissKeyboard : React.Fragment
    const wrapperProps = dismissKeyboard ? { style: { flex: 1 } } : {}

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Wrapper {...wrapperProps}>
                    <Container {...containerProps}>
                        <View
                            style={{
                                flexGrow: 1,
                                width: '100%',
                                alignSelf: resolvedMaxWidth
                                    ? 'center'
                                    : 'stretch',
                                maxWidth: resolvedMaxWidth,
                            }}
                        >
                            {children}
                        </View>
                    </Container>
                </Wrapper>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}