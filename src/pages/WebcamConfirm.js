import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";

const WebcamConfirm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 40,
        }}
      >
        <img src={state.image} width={800} />
      </div>
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          text="CONFIRM"
          style={{ marginRight: 20, marginTop: 20 }}
          callback={() =>
            navigate("/confirm_receipt", { state: { img64: state.image } })
          }
        />
        <Button
          text="RETAKE"
          style={{ marginTop: 20, paddingRight: 32.5, paddingLeft: 32.5 }}
          callback={() => navigate("/webcam")}
        />
      </div>
    </>
  );
};

export default WebcamConfirm;
