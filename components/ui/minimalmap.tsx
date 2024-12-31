'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MinimalMap() {
  const mapRef = useRef<L.Map | null>(null)
  const [position, setPosition] = useState<[number, number]>([9.959792, 76.405983]) // Initial position (first pothole)
  const [zoom, setZoom] = useState(15)

  // Define potholes with severity from 0 to 10
  const potholes: { coordinates: [number, number]; severity: number }[] = [
    { coordinates: [9.9597, 76.4059], severity: 9 },
    { coordinates: [9.963203, 76.407129], severity: 9 },
    { coordinates: [9.960385, 76.406162], severity: 6 },
    { coordinates: [9.960834, 76.406294], severity: 2 },
    { coordinates: [9.962347, 76.406757], severity: 8 },
    { coordinates: [9.963155, 76.407102], severity: 3 },
    // Add more potholes with severity values between 0 and 10
  ]

  // Custom hot color scale (from black to red, orange, yellow, and white)
  const hotColors = [
    [0, 0, 0],       // Black (low severity)
    [1, 0, 0],       // Red
    [1, 0.5, 0],     // Orange
    [1, 1, 0],       // Yellow
    [1, 1, 1],       // White (high severity)
  ]

  // Function to map severity to color using the hot color map
  const getHotColor = (severity: number): string => {
    // Map severity (0-10) to a value between 0 and 1
    const ratio = Math.min(Math.max(severity, 0), 10) / 10

    // Interpolate between the colors based on the ratio
    const scaleIndex = Math.floor(ratio * (hotColors.length - 1))

    // Get color components for this scale index
    const color = hotColors[scaleIndex]

    // Return the RGB color in CSS format
    return `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`
  }

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(position, zoom)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current)

      // Add potholes as markers
      potholes.forEach((pothole) => {
        const { coordinates, severity } = pothole

        // Get the color for the severity from the hot color scale
        const color = getHotColor(severity)

        L.circleMarker(coordinates, {
          radius: 8, // Adjust size of the marker
          fillColor: color, // Color based on severity (Hot color scale)
          color: 'black', // Border color
          weight: 2, // Border thickness
          opacity: 1,
          fillOpacity: 0.7,
        })
          .bindPopup(`Pothole Severity: ${severity}`)
          .addTo(mapRef.current)
      })

      // Draw a line connecting the potholes
      const potholeCoordinates = potholes.map(pothole => pothole.coordinates)
      
      L.polyline(potholeCoordinates, {
        color: 'red', // Line color
        weight: 4, // Line thickness
        opacity: 0.7, // Line opacity
      }).addTo(mapRef.current)

      // Update position and zoom on moveend event
      mapRef.current.on('moveend', () => {
        const center = mapRef.current?.getCenter()
        if (center) {
          setPosition([center.lat, center.lng])
        }
        setZoom(mapRef.current?.getZoom() || zoom)
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div id="map" className="absolute inset-0" />
}
