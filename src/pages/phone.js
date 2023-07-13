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
          Its recommended to use this website on a PC,
          If you wish to continue with your phone,
          turn on the "Desktop Site" option in your browser settings
          and then go back to the website (https://receipts.k9dev.me)
        </p>
    </div>
  )
}

export default Phone