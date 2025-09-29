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

// Reusable screen wrapper with Safe Area, Keyboard handling and optional scroll
export default function Screen({
    children,
    scroll = true,
    contentContainerStyle,
    maxWidth,
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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <Container {...containerProps}>
                        <View
                            style={{
                                flexGrow: 1,
                                width: '100%',
                                alignSelf: resolvedMaxWidth ? 'center' : 'stretch',
                                maxWidth: resolvedMaxWidth,
                            }}
                        >
                            {children}
                        </View>
                    </Container>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
