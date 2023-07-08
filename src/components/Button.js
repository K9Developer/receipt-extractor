import React from 'react'
import './button.css'

const Button = (props) => {
  let text = props.text
  let callback = props.callback
  if (!text) {
    text = ""
  }
  if (!callback) {
    callback = () => {}
  }

  return (
    
    <button className='button' onClick={callback} style={props.style}>{text}</button>
    
  )
}

export default Button