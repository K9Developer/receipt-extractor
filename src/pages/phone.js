import React from 'react'

const Phone = () => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    }}>
    <p
          style={{
            fontFamily: "rubik",
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          You can only use this website while on PC!
        </p>
    </div>
  )
}

export default Phone