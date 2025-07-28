import React from "react"
import { IconProps } from "types/icon"

const Medusa: React.FC<IconProps> = ({
  size = "20",
  color = "#9CA3AF",
  ...attributes
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill={color}
      {...attributes}
    >
      <g>
        <path d="M60,0C26.9,0,0,26.9,0,60s26.9,60,60,60s60-26.9,60-60S93.1,0,60,0z M60,111C31.2,111,9,88.8,9,60S31.2,9,60,9
        s51,22.2,51,51S88.8,111,60,111z"/>
        <path d="M83.2,45.4c-1.3-1.4-3.4-1.5-4.8-0.2L61,61.5L41.6,41.2c-1.3-1.4-3.5-1.5-4.9-0.2c-1.4,1.3-1.5,3.5-0.2,4.9l21.6,23
        c0.7,0.7,1.6,1.1,2.5,1.1c0.9,0,1.8-0.3,2.5-1.1l21.6-21.6C84.5,48.9,84.5,46.7,83.2,45.4z"/>
      </g>
    </svg>
  )
}

export default Medusa