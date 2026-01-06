/**
 * Mobile stub for CubeViewer
 * The web implementation is in index.web.tsx
 */

import type { KPattern } from 'cubing/kpuzzle'
import * as THREE from 'three'
import type { SceneConfig } from '@/config/scene-config'

// Type definitions for mobile (avoid importing RubiksCube which uses React Three Fiber)
export interface RubiksCubeRef {
  performMove: (move: string) => void
  reset: () => void
}

export interface CubeColors {
  white: string
  yellow: string
  green: string
  blue: string
  red: string
  orange: string
  inner: string
}

export interface CubeViewerProps {
  pattern?: KPattern | null
  facelets?: string
  quaternionRef?: React.MutableRefObject<THREE.Quaternion>
  cubeRef?: React.RefObject<RubiksCubeRef | null>
  config?: SceneConfig
  animationSpeed?: number
  cubeColors?: CubeColors
  enableZoom?: boolean
}

/**
 * Mobile stub for CubeViewer
 * On mobile, 3D rendering is not available
 * Returns a placeholder or null
 */
export function CubeViewer(_props: CubeViewerProps) {
  // Return a simple placeholder for mobile
  // You could replace this with a 2D cube representation using react-native-svg
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      borderRadius: 8,
    }}>
      <div style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>
        3D Cube Viewer
        <br />
        <span style={{ fontSize: 12 }}>Not available on mobile</span>
      </div>
    </div>
  )
}
