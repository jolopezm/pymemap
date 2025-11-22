import { renderHook, act } from '@testing-library/react-native'
import { useResponsiveDimensions } from '../../hooks/useResponsiveDimensions'
import { Dimensions } from 'react-native'

describe('useResponsiveDimensions', () => {
    const mockDimensions = {
        window: { width: 400, height: 800 },
        screen: { width: 400, height: 800 }
    }

    beforeEach(() => {
        jest.spyOn(Dimensions, 'get').mockReturnValue(mockDimensions.window)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Initial dimensions', () => {
        it('returns correct dimensions on mount', () => {
            const { result } = renderHook(() => useResponsiveDimensions())

            expect(result.current.screenWidth).toBe(400)
            expect(result.current.screenHeight).toBe(800)
            expect(result.current.cardWidth).toBe(180) // 400 * 0.45
            expect(result.current.cardImageHeight).toBe(168) // 400 * 0.42
        })

        it('provides wp helper function', () => {
            const { result } = renderHook(() => useResponsiveDimensions())

            expect(result.current.wp(50)).toBe(200) // 50% of 400
            expect(result.current.wp(100)).toBe(400) // 100% of 400
        })

        it('provides hp helper function', () => {
            const { result } = renderHook(() => useResponsiveDimensions())

            expect(result.current.hp(50)).toBe(400) // 50% of 800
            expect(result.current.hp(100)).toBe(800) // 100% of 800
        })
    })

    describe('Dimension changes', () => {
        it('updates dimensions on window resize', () => {
            let dimensionListener

            jest.spyOn(Dimensions, 'addEventListener').mockImplementation((event, listener) => {
                dimensionListener = listener
                return { remove: jest.fn() }
            })

            const { result } = renderHook(() => useResponsiveDimensions())

            expect(result.current.screenWidth).toBe(400)

            // Simulate dimension change
            act(() => {
                dimensionListener({ window: { width: 600, height: 1000 } })
            })

            expect(result.current.screenWidth).toBe(600)
            expect(result.current.screenHeight).toBe(1000)
            expect(result.current.cardWidth).toBe(270) // 600 * 0.45
        })
    })
})
