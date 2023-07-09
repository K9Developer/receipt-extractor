import React, { useEffect } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import github from "../assets/github.png";
import info from "../assets/info.png";
import "./home.css"

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
      navigate("/notallowed");
    }
  }, [])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
    }}>
    <div className="header" style={
      {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,

      }
    }>
      <a href="https://www.buymeacoffee.com/k9dev" target="_blank" rel="noopener noreferrer"style={{position: "absolute", bottom: 10, left: 10}}><img className="lnk_btn" src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=k9dev&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff" /></a>
      <img src={github} width={60} height={60} className="lnk_btn" style={{
        cursor: "pointer",
        marginRight: 10
      }} onClick={()=>window.open('https://github.com/KingOfTNT10', '_blank', 'noreferrer')}></img>
      <img src={info} width={60} height={60} className="lnk_btn" style={{
        cursor: "pointer"
      }} onClick={()=>navigate("/info")}></img>
    </div>
    <div
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "90vh",
      }}
    >
      <Button
        text="UPLOAD RECEIPTS"
        callback={() => {
          navigate("/uploader", { replace: true });
        }}
      />
    </div></div>
  );
};

export default Home;
