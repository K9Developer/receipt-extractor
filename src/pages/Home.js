import React, { useEffect } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import coffee from "../assets/coffee.png";
import github from "../assets/github.png";

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
      <img src={coffee} width={70} height={70} style={{
        cursor: "pointer",
        marginRight: 10
      }} onClick={()=>window.open('https://buymeacoffee.com/k9dev', '_blank', 'noreferrer')}></img>
      <img src={github} width={70} height={70} style={{
        cursor: "pointer"
      }} onClick={()=>window.open('https://github.com/KingOfTNT10', '_blank', 'noreferrer')}></img>
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
