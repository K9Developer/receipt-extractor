import React from "react";
import back from "../assets/back.png";
import "./home.css";
import { useNavigate } from "react-router-dom";
const Info = () => {
  const navigate = useNavigate();
  return (
    <>
    <img
        src={back}
        width={60}
        height={60}
        className="lnk_btn"
        style={{
          cursor: "pointer",
          marginLeft: 10,
          position: "absolute",
          marginTop: 10,
        }}
        onClick={() =>
            navigate(-1)
        }
      />
    <div style={{
        width: "100%",
        height: "90vh",
        display: "flex",
        justifyContent: "center",
    }}>
      
      <p
          style={{
            fontFamily: "rubik",
            fontSize: "1.8rem",
            textAlign: "center",
            width: "50%",
            lineHeight: 2
          }}
        >
          My name is Ilai, i'm 15 and I created this website to help travelers manage their expenses via receipt scanning,
          You take a picture of multiple receipts and the website will automatically detect all the receipts in that image
          with a custom AI I made with 10,000+ images of receipts and non receipts. After it detects them, it will scan their
          business name and will seperate each receipt to each own file and zip them all together for you to download.
          I hope you'll find my website useful! and If you liked it, feel free to <a href="https://www.buymeacoffee.com/k9dev" target="_blank" rel="noopener noreferrer">buy me a coffee</a>!
          <br/>
          To use the website all you have to do, is take your receipts, lay them down on a dark background, make sure they are as flat and as straight as possible and take a picture from a bird's eye view
          Then just upload that picture and the rest of the work is done for you! <br/>
          enjoy!
        </p>
    </div></>
  );
};

export default Info;
