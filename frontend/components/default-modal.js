import { Modal, StyleSheet, Animated, Pressable } from 'react-native'
import { useRef, useEffect } from 'react'
import Feather from 'react-native-vector-icons/Feather'

export default function DefaultModal({ visible, onRequestClose, children }) {
    const slideAnim = useRef(new Animated.Value(500)).current

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(slideAnim, {
                toValue: 500,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }, [visible, slideAnim])

    return (
        <Modal visible={visible} onRequestClose={onRequestClose} transparent>
            <Pressable style={styles.backdrop} onPress={onRequestClose}>
                <Pressable>
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            { transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <Pressable
                            style={styles.closeButton}
                            onPress={onRequestClose}
                        >
                            <Feather name="x" size={24} color="#333" />
                        </Pressable>
                        {children}
                    </Animated.View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%', // Un poco más ancho para el mapa
        margin: 20,
        padding: 0, // Quitamos el padding para que el mapa ocupe todo el espacio
        borderRadius: 10,
        justifyContent: 'center',
        backgroundColor: 'rgba(250, 250, 250, 1)',
        overflow: 'hidden', // Importante para que los bordes redondeados corten el mapa
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
})
