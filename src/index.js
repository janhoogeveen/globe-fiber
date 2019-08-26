import ReactDOM from 'react-dom'
import * as THREE from 'three/src/Three'
import React, { useState, useRef, useMemo, useEffect } from 'react'
// A THREE.js React renderer, see: https://github.com/drcmda/react-three-fiber
import { Canvas, useRender, useThree } from 'react-three-fiber'
// A React animation lib, see: https://github.com/react-spring/react-spring

import { useSpring, animated, a } from 'react-spring/three'
import './styles.css'

const earthmap = require('./earthmap1k.jpg')

function Octahedron(props) {
  let group = useRef()
  let theta = 0

  const { earthmap } = props

  useRender(() => {
    // Some things maybe shouldn't be declarative, we're in the render-loop here with full access to the instance
    const r = 1 * THREE.Math.degToRad((theta -= 0.1))
    group.current.rotation.set(0, r, 0)
  })

  const texture = useMemo(() => new THREE.TextureLoader().load(earthmap), [earthmap])

  const [active, setActive] = useState(false)
  const [hovered, setHover] = useState(false)

  const { color, pos, ...rest } = useSpring({
    color: active ? 'hotpink' : 'white',
    pos: active ? [1, 1, 1] : [2, 2, 2],
    'material-opacity': hovered ? 1 : 0.4,
    scale: active ? [1.5, 1.5, 1.5] : hovered ? [1.1, 1.1, 1.1] : [1, 1, 1],
    rotation: active ? [0, THREE.Math.degToRad(-360), 0] : [0, 0, 0],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
  })
  return (
    <group ref={group}>
      <animated.mesh onClick={e => setActive(!active)} onPointerOver={e => setHover(true)} onPointerOut={e => setHover(false)} {...rest}>
        <sphereGeometry attach="geometry" args={[2, 128, 128]} />
        <meshLambertMaterial attach="material">
          <primitive attach="map" object={texture} />
        </meshLambertMaterial>
      </animated.mesh>
    </group>
  )
}

const PointLight = () => {
  return <pointLight color={'white'} intensity={1} position={[10, 10, 10]} />
}

function Text({ children, position, opacity = 1, color = 'white', fontSize = 410 }) {
  const {
    size: { width, height },
    viewport: { width: viewportWidth, height: viewportHeight }
  } = useThree()

  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight

  const [active, setActive] = useState(false)
  const [hovered, setHover] = useState(false)

  const { posX, posY, posZ, ...rest } = useSpring({
    posX: hovered ? 2 : 1,
    posY: active ? 1 : 1,
    posZ: active ? 1 : 1,
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
  })

  const canvas = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 2048
    const context = canvas.getContext('2d')
    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = color
    context.fillText(children, 1024, 1024 - 410 / 2)
    return canvas
  }, [children, color, fontSize])

  const positionX = posX
    .interpolate({
      range: [0, 0.5, 1],
      output: [1, 2, 1]
    })
    .interpolate(x => {
      console.log(x)
      return x
    })

  console.log(positionX)

  return (
    <a.sprite
      onClick={e => setActive(!active)}
      onPointerOver={e => setHover(true)}
      onPointerOut={e => setHover(false)}
      {...rest}
      scale={[scale, scale, 1]}
      position={[0, 0, 1]}>
      <a.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture attach="map" image={canvas} premultiplyAlpha onUpdate={s => (s.needsUpdate = true)} />
      </a.spriteMaterial>
    </a.sprite>
  )
}

ReactDOM.render(
  <Canvas>
    <ambientLight color="lightblue" />
    <PointLight />
    {/* <Octahedron earthmap={earthmap} /> */}
    <Text>lorem</Text>
  </Canvas>,
  document.getElementById('root')
)
