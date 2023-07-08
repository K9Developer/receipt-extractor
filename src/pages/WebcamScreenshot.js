import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const WebcamScreenshot = () => {
  const webcamRef = useRef(null);
  const [camHere, setCamHere] = useState(false);
  const [loadText, setLoadText] = useState("Loading Camera...");
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    navigate("/confirm_webcam", { state: { image: imageSrc } });
  }, [webcamRef]);

  const loadTooLongCheck = () => {
    if (!camHere) {
      setLoadText(
        "Loading Camera... There seems to be a problem with your camera, please check connection and try again"
      );
    }
  };

  setTimeout(() => {
    loadTooLongCheck();
  }, 4000);

  return (
    <div
      className="container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 40,
        height: "100vh",
      }}
    >
      {camHere ? (
        <>
          <Webcam
            height={600}
            width={1000}
            ref={webcamRef}
            audio={false}
            onUserMediaError={() => {
              setCamHere(false);
            }}
          />
          <Button
            text="TAKE PICTURE"
            style={{ marginTop: 10 }}
            callback={capture}
          />
        </>
      ) : (
        <>
          <Webcam onUserMedia={() => setCamHere(true)} />
          <div
            className="container"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
            }}
          >
            <p
              style={{
                fontSize: "2rem",
                fontFamily: "rubik",
                width: "70%",
                textAlign: "center",
              }}
            >
              {loadText}
            </p>
            <Button
              text="GO BACK"
              callback={() => {
                navigate("/uploader", { replace: true });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default WebcamScreenshot;
