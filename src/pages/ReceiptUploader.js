import React, { useState } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import "./receipt_uploader.css";

const ReceiptUploader = () => {
  const [validFile, setValidFile] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const fileToB64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(["GOOD", reader.result]);
      reader.onerror = (error) => resolve(["ERROR", error]);
    });
  };

  const fileUpload = (t) => {
    if (t.target.files[0].type.split("/")[0] != "image") {
      console.log("File not valid");
      setValidFile(false);
    } else {
      setLoadingImg(true);
      console.log(t.target.files[0]);
      fileToB64(t.target.files[0]).then((d) => {
        if (d[0] == "ERROR") {
          setImageError(true);
          console.log(d[1]);
        } else {
          navigate("/confirm_file", { state: { image: d[1] } });
        }
        setLoadingImg(false);
      });
    }
  };

  return (
    <>
      {loadingImg || imageError ? (
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
          {imageError ? (
            <p
              style={{
                fontFamily: "rubik",
                fontSize: "3rem",
              }}
            >
              There was an error while loading the image! (check console for
              error)
            </p>
          ) : (
            <p
              style={{
                fontFamily: "rubik",
                fontSize: "3rem",
              }}
            >
              Loading Image...
            </p>
          )}
        </div>
      ) : (
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "90vh",
          }}
        >
          <Button
            text="USE WEBCAM"
            style={{ marginBottom: 10, maxWidth: "17.5rem", minWidth: "17.5rem" }}
            callback={() => {
              navigate("/webcam");
            }}
          />
          <label
            htmlFor="fileupload"
            className="label-upload"
            style={{
              maxWidth: "15rem",
              minWidth: "13rem",
              background: "#58B9FF",
              border: "none",
              padding: "25px",
              borderRadius: "10px",
              fontSize: "2rem",
              fontFamily: "rubik",
              cursor: "pointer",
            }}
          >
            UPLOAD IMAGE
          </label>
          <input
            id="fileupload"
            style={{ display: "none" }}
            type="file"
            onChange={fileUpload}
          />
          {validFile == false ? (
            <p
              style={{
                color: "#f76560",
                fontFamily: "rubik",
                fontSize: "1rem",
              }}
            >
              The file needs to be an image!
            </p>
          ) : null}
        </div>
      )}
    </>
  );
};

export default ReceiptUploader;
