import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/Button";
import FileSaver from "file-saver";

const DownloadZip = () => {
  const { state } = useLocation();

  const downloadURI = (uri, name) => {
    FileSaver.saveAs(uri, name);
  };

  console.log(state);
  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "90vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: "rubik",
            fontSize: "2rem",
          }}
        >
          Thanks for using our service!
        </p>
        <Button
          text="Download zip"
          callback={() =>
            downloadURI(
              state.data.Files[0].Url.replace(
                state.data.Files[0].FileName,
                "receipts"
              ),
              "receipts.zip"
            )
          }
        />
      </div>
    </>
  );
};

export default DownloadZip;
