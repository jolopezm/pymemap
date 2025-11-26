import AsyncStorage from '@react-native-async-storage/async-storage'

export async function checkProfilePicUrl(user) {
    if (!user || !user.profile_pic) {
        return false
    }

    const url = user.profile_pic.trim()
    if (!url) {
        return false
    }

    const cacheKey = `profile_pic_ok:${url}`
    try {
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached !== null) return cached === '1'

        // intentar HEAD para validar rápidamente
        let res = await fetch(url, { method: 'HEAD' })
        let ok = false

        if (res.ok) {
            const ct = (res.headers.get('content-type') || '').toLowerCase()
            if (ct.startsWith('image/')) {
                ok = true
            } else {
                // si content-type no indica imagen, revisar cuerpo por "<Error"
                const body = await (await fetch(url)).text()
                ok = !/<\s*Error\b/i.test(body)
            }
        } else {
            // HEAD no ok -> intentar GET y buscar tag <Error>
            const body = await (await fetch(url)).text()
            ok = !/<\s*Error\b/i.test(body)
        }

        await AsyncStorage.setItem(cacheKey, ok ? '1' : '0')
        return ok
    } catch (e) {
        return false
    }
}
