import { useState, useEffect } from 'react'
import { Dimensions } from 'react-native'

export function useResponsiveDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window')
    return {
      screenWidth: width,
      screenHeight: height,
      cardWidth: width * 0.45,
      cardImageHeight: width * 0.42,
      featuredSize: width * 0.17,
      categorySize: width * 0.13,
      wp: (percentage) => (width * percentage) / 100,
      hp: (percentage) => (height * percentage) / 100,
    }
  })

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width, height } = window
      setDimensions({
        screenWidth: width,
        screenHeight: height,
        cardWidth: width * 0.45,
        cardImageHeight: width * 0.42,
        featuredSize: width * 0.17,
        categorySize: width * 0.13,
        wp: (percentage) => (width * percentage) / 100,
        hp: (percentage) => (height * percentage) / 100,
      })
    })

    return () => subscription?.remove()
  }, [])

  return dimensions
}
