import React from "react";
import Button from "../components/Button";
import { useNavigate, useLocation } from "react-router-dom";

const NoStep = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "90vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Button
        text="RE-UPLOAD IMAGE"
        style={{
          marginBottom: 20,
          width: "21rem",
        }}
        callback={() => {
          navigate("/uploader");
        }}
      />
      <Button
        text="MANUAL FIX"
        callback={() => navigate("/manual", { state })}
        style={{ width: "21rem" }}
      />
    </div>
  );
};

export default NoStep;
