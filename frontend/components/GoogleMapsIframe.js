function GoogleMapsIframe({ address, width = '100%', height = '400px' }) {
    const encodedAddress = encodeURIComponent(address)
    const src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`

    return (
        <iframe
            title="Google Maps"
            src={src}
            width={width}
            height={height}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    )
}

export default GoogleMapsIframe
