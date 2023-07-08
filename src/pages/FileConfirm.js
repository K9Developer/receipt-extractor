import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";

const FileConfirm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

  const turn = (img64) => {
    console.log("turn");
    const img = new Image();
    img.src = img64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height; // Swap the width and height to account for rotation
      canvas.height = img.width;

      const ctx = canvas.getContext("2d");
      canvas.width = img.height;
      canvas.height = img.width;

      ctx.translate(img.height / 2, img.width / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2); // Adjust the coordinates to align the image properly

      const resizedBase64 = canvas.toDataURL("image/jpeg"); // You can change the image format here

      setImage(resizedBase64);
    };
  };

  useEffect(() => {
    setImage(state.image);
  }, []);
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
        <img src={image} height={600} />
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
            navigate("/confirm_receipt", { state: { img64: image } })
          }
        />
        <Button
          text="RE-UPLOAD"
          style={{
            marginTop: 20,
            paddingRight: 32.5,
            marginRight: 20,
            paddingLeft: 32.5,
          }}
          callback={() => navigate("/uploader")}
        />
        <Button
          text="ROTATE"
          style={{ marginTop: 20, paddingRight: 32.5, paddingLeft: 32.5 }}
          callback={() => turn(image)}
        />
        <p style={{
            fontFamily: "rubik",
                fontSize: "1.2rem",
                width: "50%",
                textAlign: "center",
                top: "80%",
                position: "absolute",
          }}>Rotate the image to make all the receipts orientated correctly</p>
      </div>
    </>
  );
};

export default FileConfirm;
