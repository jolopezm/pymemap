import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, borderRadius, shadows, typography, responsive } from '../../styles/theme'

const PROMO_BANNERS = [
    {
        id: '1',
        title: 'Apoya local 🇨🇱',
        subtitle: 'Descubre PyMEs cerca de ti',
        icon: 'heart',
        colors: ['#9B59B6', '#8E44AD'],
    },
    {
        id: '2',
        title: 'Reserva fácil ⚡',
        subtitle: 'Agenda tu cita en segundos',
        icon: 'calendar',
        colors: ['#E74C3C', '#C0392B'],
    },
    {
        id: '3',
        title: 'Nuevos negocios 🎉',
        subtitle: 'Explora lo último en tu zona',
        icon: 'star',
        colors: ['#3498DB', '#2980B9'],
    },
]

import React from 'react'

const HomePromoBanner = React.memo(function HomePromoBanner() {
    const carouselRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const nextIndex = (currentIndex + 1) % PROMO_BANNERS.length
                carouselRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                })
                setCurrentIndex(nextIndex)
            }
        }, 4000)

        return () => clearInterval(interval)
    }, [currentIndex])

    return (
        <View style={styles.container}>
            <FlatList
                ref={carouselRef}
                data={PROMO_BANNERS}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={responsive.screenWidth - 32}
                decelerationRate="fast"
                keyExtractor={item => item.id}
                onMomentumScrollEnd={event => {
                    const index = Math.round(
                        event.nativeEvent.contentOffset.x / (responsive.screenWidth - 32)
                    )
                    setCurrentIndex(index)
                }}
                renderItem={({ item }) => (
                    <View style={styles.banner}>
                        <LinearGradient
                            colors={item.colors}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.content}>
                                <View style={styles.text}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                                </View>
                            </View>
                            <View style={styles.image}>
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons
                                        name={item.icon}
                                        size={40}
                                        color="rgba(255,255,255,0.9)"
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                )}
            />
        </View>
    )
})

export default HomePromoBanner

const styles = StyleSheet.create({
    container: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background,
    },
    banner: {
        width: responsive.screenWidth - 32,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.card,
        overflow: 'hidden',
        ...shadows.subtle,
    },
    gradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg + 2,
        minHeight: responsive.screenWidth * 0.22,
    },
    content: {
        flex: 1,
    },
    text: {
        flex: 1,
    },
    title: {
        ...typography.h4,
        fontWeight: '700',
        color: colors.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.small,
        color: 'rgba(255, 255, 255, 0.95)',
        fontWeight: '500',
    },
    image: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
})
