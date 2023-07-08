import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import "./confirm_receipt.css";

const API_KEY = "AIzaSyAgqN_rBLwp9eWHx6zuvaM3DD8U69ZiHgE"; // Its ok, its restricted to my website only chill
let imgData = null;
let completedData = null;
let newPoints = null;
let preds = null;

const detectText = async (base64Image) => {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
  base64Image = base64Image.split(",")[1];
  const request = {
    requests: [
      {
        image: {
          content: base64Image,
        },
        features: [
          {
            type: "TEXT_DETECTION",
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (response.ok) {
      const data = await response.json();
      const extractedText = data.responses[0].textAnnotations;
      if (extractedText == undefined) {
        return ["ERROR", "RESPONSE != OK"];
      }
      return ["GOOD", extractedText];
    } else {
      return ["ERROR", "RESPONSE != OK"];
    }
  } catch (error) {
    return ["ERROR", "API ERROR"];
  }
};

// FIX ZIP DOWNLOAD, possible problems:  scaleUpMaskCoordinates, seperateReceipts
// TO check if the scaleUpMaskCoordinates are correct - https://stackoverflow.com/questions/48301186/cropping-concave-polygon-from-image-using-opencv-python

const scaleUpMaskCoordinates = (
  maskCoordinates,
  originalWidth,
  originalHeight,
  oldWidth,
  oldHeight
) => {
  const receipts = [];
  for (let receipt of maskCoordinates) {
    const scaledUpMaskCoordinates = [];
    for (const { x, y } of receipt.points) {
      let scaledX = 0;
      let scaledY = 0;

      scaledX = x * (originalWidth / oldWidth);
      scaledY = y * (originalHeight / oldHeight);

      scaledUpMaskCoordinates.push({ x: scaledX, y: scaledY });
    }
    let receipt_width = receipt.width * (originalWidth / oldWidth);
    let receipt_height = receipt.height * (originalHeight / oldHeight);

    let receipt_x = null;
    let receipt_y = null;
    if (receipt.pos) {
      receipt_x =
        receipt.pos.x * (originalWidth / oldWidth) - receipt_width / 2;
      receipt_y =
        receipt.pos.y * (originalHeight / oldHeight) - receipt_height / 2;
    } else {
      receipt_x = receipt.x * (originalWidth / oldWidth) - receipt_width / 2;
      receipt_y = receipt.y * (originalHeight / oldHeight) - receipt_height / 2;
    }

    receipts.push({
      size: { width: receipt_width, height: receipt_height },
      points: scaledUpMaskCoordinates,
      pos: { x: receipt_x, y: receipt_y },
    });
  }
  return receipts;
};

const polyPositions = (points) => {
  let highestPoint = null;
  let lowestPoint = null;
  for (let point of points) {
    if (lowestPoint == null || point.y > lowestPoint.y) {
      lowestPoint = point;
    }
    if (highestPoint == null || point.y < highestPoint.y) {
      highestPoint = point;
    }
  }
  return {
    bottom: { x: lowestPoint.x, y: lowestPoint.y },
    top: { x: highestPoint.x, y: highestPoint.y },
  };
};

const formatTextAnnots = (textRes) => {
  let counter = 0;
  const totalTexts = [];

  for (let text of textRes) {
    if (counter != 0) {
      let polyPos = polyPositions(text.boundingPoly.vertices);
      totalTexts.push({
        text: text.description,
        position: polyPos,
      });
    }
    counter++;
  }
  return totalTexts;
};

const getNameByPosition = (textJson, ignore = null, totalIterations = 0) => {
  if (totalIterations == 3) {
    return ["ERROR"];
  }
  const totalTexts = [];
  let prevBottomY = null;
  let prevTopY = null;
  let counter = 0;
  for (let text of textJson) {
    if (ignore != null && text == ignore[counter]) {
      continue;
    }
    counter++;

    if (
      prevBottomY == null ||
      Math.abs(text.position.top.y - prevBottomY) < 100 ||
      Math.abs(text.position.top.y - prevTopY) < 40
    ) {
      totalTexts.push(text);
      prevBottomY = text.position.bottom.y;
      prevTopY = text.position.top.y;
    }
  }
  let totalText = "";
  for (let text of totalTexts) {
    totalText += text.text;
  }
  if (totalText.length < 4) {
    totalIterations += 1;
    return getNameByPosition(textJson, totalTexts, totalIterations);
  }

  return totalTexts;
};

const getStringLang = async (text) => {
  const url = "https://language-detection4.p.rapidapi.com/language-detection";
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
      "X-RapidAPI-Key": "063cfa1344msh631f5a1210a96ffp127ee2jsna7649762ad76",
      "X-RapidAPI-Host": "language-detection4.p.rapidapi.com",
    },
    body: JSON.stringify([
      {
        id: "1",
        language: "en",
        text,
      },
    ]),
  };
  try {
    const response = await fetch(url, options);
    let result = await response.json();
    result = result[0].detected_language;
    return ["GOOD", result];
  } catch (error) {
    return ["ERROR"];
  }
};

const getNameBySize = (textJson) => {
  const totalTexts = [];
  let titleHeight = textJson[0].position.bottom.y - textJson[0].position.top.y;
  for (let text of textJson) {
    let currHeight = text.position.bottom.y - text.position.top.y;

    if (Math.abs(titleHeight - currHeight) < 50) {
      totalTexts.push(text);
    }
  }
  return totalTexts;
};

const getNameByAscii = async (textJson) => {
  const totalTexts = [];
  let counter = 0;
  let titleLang = null;
  for (let text of textJson) {
    let currLang = await getStringLang(text.text);
    if (currLang[0] == "ERROR") {
      continue;
    }
    currLang = currLang[1];
    if (counter == 0) {
      titleLang = currLang;
    }
    counter += 1;
    if (currLang.length && currLang == titleLang) {
      totalTexts.push(text);
    } else {
      break;
    }
  }
  return totalTexts;
};

const ConfirmReceiptCount = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [currText, setCurrText] = useState("");
  // const [showDetections, setShowDetections] = useState(true);
  const [detectionImage, setDetectionImage] = useState(null);
  const [analyzingReceipts, setAnalyzingReceipts] = useState(null);
  const [anaCompleted, setAnaCompleted] = useState(0);
  const [anaTotal, setAnaTotal] = useState(0);
  const [downloadError, setDownloadError] = useState(null);

  const compileFiles = () => {
    while (!completedData) {}

    const apiUrl =
      "https://v2.convertapi.com/convert/any/to/zip?Secret=0ei0lPzy2lS6We1K";

    const requestBody = {
      Parameters: [
        {
          Name: "Files",
          FileValues: completedData,
        },
        {
          Name: "StoreFile",
          Value: true,
        },
      ],
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        setTimeout(() => {
          navigate("/download_receipts", { state: { data } });
        }, 1000);
      })
      .catch((error) => {
        setDownloadError(true);
      });
  };

  useEffect(() => {
    if (anaCompleted == anaTotal && anaCompleted != 0) {
      compileFiles();
    }
  }, [anaCompleted]);

  const getName = async (apiRes) => {
    /*
    1. Total name must be 6 characters or above
    2. Cut at special chars
    3. Make sure if connecting strings that they are close
    */
    let textJson = formatTextAnnots(apiRes);
    let nameJson = getNameByPosition(textJson);
    if (nameJson[0] == "ERROR") {
      return ["ERROR"];
    }
    nameJson = getNameBySize(nameJson);
    let finalName = await getNameByAscii(nameJson);
    return finalName;
  };

  const getBusinessName = (img64, counter) => {
    // 1. When reading business name, order all text by Y position first, so I read it from the top to bottom.
    // 2. If no name by criteria in top third of image remove name
    // 3. if remove all double _ and name is less than 3, remove name
    return new Promise((resolve) => {
      const img = new Image();
      img.src = img64;
      img.onload = () => {
        let receiptHeaderHeight = img.height / 2;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = receiptHeaderHeight;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          receiptHeaderHeight,
          0,
          0,
          img.width,
          receiptHeaderHeight
        );
        let header64 = canvas.toDataURL("image/jpeg");
        detectText(header64).then((res) => {
          if (res[0] == "ERROR") {
            resolve({ name: `receipt-${counter}` });
          } else {
            getName(res[1]).then((name) => {
              if (name[0] == "ERROR" || name.length < 1) {
                resolve({ name: `receipt-${counter}` });
              } else {
                let totalText = "";
                let c = 0;
                for (let text of name) {
                  totalText +=
                    text.text + (counter == name.length - 1 ? "" : "_");
                  c += 1;
                }
                if (totalText.split("_").length > 3) {
                  let totalTextTmp = totalText;
                  totalText = "";
                  totalText += totalTextTmp.split("_")[0] + "_";
                  totalText += totalTextTmp.split("_")[1] + "_";
                  totalText += totalTextTmp.split("_")[2];
                }
                totalText = totalText
                  .toLowerCase()
                  .replace(/[^a-zA-Z_]/g, "")
                  .replace(/_*$/g, "");

                if (totalText.length < 3) {
                  resolve({ name: `receipt-${counter}` });
                } else {
                  resolve({ name: totalText });
                }
              }
            });
          }
        });
      };
    });
  };

  const getAIresult = (img64) => {
    return new Promise((resolve) => {
      fetch(
        "https://outline.roboflow.com/receiptextractor-sin8j/1?api_key=eoszgDBNd4w7vLAaTtvV&confidence=0.40",
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua":
              '"Opera GX";v="99", "Chromium";v="113", "Not-A.Brand";v="24"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
          referrer: "https://app.roboflow.com/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: img64,
          method: "POST",
          credentials: "omit",
        }
      )
        .then((d) => {
          d.json().then((d) => {
            resolve(["GOOD", d]);
          });
        })
        .catch((e) => {
          resolve(e);
        });
    });
  };

  const manipulateImage = async (img64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = img64;

      img.onload = () => {
        const aspectRatio = img.height / img.width;
        const height = 600;

        const canvas = document.createElement("canvas");
        canvas.width = 600 / aspectRatio;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, height);
        const resizedBase64 = canvas.toDataURL("image/jpeg"); // You can change the image format here
        ctx.filter = "brightness(60%) contrast(150%)";
        ctx.drawImage(img, 0, 0, canvas.width, height);
        const filteredBase64 = canvas.toDataURL("image/jpeg"); // You can change the image format here
        resolve({
          resizedImage: resizedBase64,
          filteredImage: filteredBase64,
          orgWidth: img.width,
          orgHeight: img.height,
          currWidth: canvas.width,
          currHeight: canvas.height,
        });
      };
    });
  };

  const generateRandomLightColor = () => {
    let red, green, blue;
    let minBrightness = 50;
    do {
      red = Math.floor(Math.random() * 256);
      green = Math.floor(Math.random() * 256);
      blue = Math.floor(Math.random() * 256);
    } while (red + green + blue < minBrightness * 3);
    let hex =
      "#" +
      ((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1) +
      "78";
    return hex;
  };

  const darkenColor = (color, amount) => {
    return (
      "#" +
      color
        .replace(/^#/, "")
        .replace(/../g, (color) =>
          (
            "0" +
            Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(
              16
            )
          ).substr(-2)
        )
    );
  };
  const separateReceipts = (points, img64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = img64;

      img.onload = () => {
        const receipt_images = [];

        // scrCtx.save();

        for (let receipt of points) {
          const srcCanvas = document.createElement("canvas");
          srcCanvas.width = img.width;
          srcCanvas.height = img.height;
          const scrCtx = srcCanvas.getContext("2d");

          const destCanvas = document.createElement("canvas");
          const destCtx = destCanvas.getContext("2d");
          destCanvas.width = receipt.size.width;
          destCanvas.height = receipt.size.height;

          scrCtx.beginPath();
          let counter = 0;
          for (let pointSet of receipt.points) {
            if (counter == 0) {
              scrCtx.moveTo(pointSet.x, pointSet.y);
            } else {
              scrCtx.lineTo(pointSet.x, pointSet.y);
            }
            counter++;
          }
          scrCtx.closePath();

          scrCtx.clip();

          scrCtx.drawImage(img, 0, 0);
          destCtx.drawImage(
            srcCanvas,
            receipt.pos.x,
            receipt.pos.y,
            receipt.size.width,
            receipt.size.height,
            0,
            0,
            receipt.size.width,
            receipt.size.height
          );
          const cutReceiptClean = destCanvas.toDataURL("image/jpeg");
          destCtx.filter = "brightness(70%) contrast(400%) grayscale(100%)";
          destCtx.drawImage(destCanvas, 0, 0);
          const cutReceiptFiltered = destCanvas.toDataURL("image/jpeg");

          // scrCtx.restore();
          receipt_images.push({
            clean: cutReceiptClean,
            filtered: cutReceiptFiltered,
          });
        }

        resolve({
          images: receipt_images,
        });
      };
    });
  };

  const drawPoly = (points, img64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = img64;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        for (let receipt of points) {
          // let randomColor = "#"+Math.floor(Math.random()*16777215).toString(16) + "78";
          let randomColor = generateRandomLightColor();
          ctx.fillStyle = randomColor;
          ctx.strokeStyle = darkenColor(randomColor, -10).slice(0, 7);
          ctx.beginPath();
          let counter = 0;
          for (let pointSet of receipt) {
            if (counter == 0) {
              ctx.moveTo(pointSet.x, pointSet.y);
            } else {
              ctx.lineTo(pointSet.x, pointSet.y);
            }
            counter++;
          }
          ctx.closePath();
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        const newImage = canvas.toDataURL("image/jpeg"); // You can change the image format here

        resolve({
          newImage,
        });
      };
    });
  };

  const handleImage = async () => {
    setCurrText("Predicting receipts...");

    imgData = state.imgData
      ? state.imgData
      : await manipulateImage(state.img64);

    let predictions = state.receipts
      ? [null, { predictions: state.receipts }]
      : await getAIresult(imgData.filteredImage);
    newPoints = scaleUpMaskCoordinates(
      predictions[1].predictions,

      imgData.orgWidth,
      imgData.orgHeight,
      imgData.currWidth,
      imgData.currHeight
      // state.scale ? state.scale : null
    );

    const pnts = [];
    for (let receipt of predictions[1].predictions) {
      pnts.push(receipt.points);
    }

    drawPoly(pnts, imgData.resizedImage).then((d) =>
      setDetectionImage(d.newImage)
    );
    if (predictions[0] == "ERROR") {
      setCurrText(
        "We have encountered an error while getting predictions, look at the console for more details. try again in 5 seconds"
      );
      preds = null;
    } else {
      setCurrText(
        `We have detected ${predictions[1].predictions.length} receipt(s), is that correct?`
      );
      preds = predictions[1];
    }
  };

  // useEffect(() => {

  // }, [detectionImage])

  useEffect(() => {
    if (state.receipts) {
      preds = state.receipts;

      // setNewPoints(state.receipts);
    }
    handleImage();
  }, []);
  return analyzingReceipts || downloadError ? (
    downloadError ? (
      <div>
        <p
          style={{
            fontFamily: "rubik",
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          An error has occurred when zipping your files! please try again later.
          (error info in console)
        </p>
      </div>
    ) : (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          // justifyContent: 'center',
          alignItems: "center",
          marginTop: "2vh",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontFamily: "rubik",
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          Analyzing Receipts...
        </p>
        <div
          style={{
            width: `${Math.round((60 / anaTotal) * anaCompleted) + 5}%`,
            height: "4%",
            background: "#4287f5",
            borderRadius: 15,
            alignItems: "center",
            // position: "relative",
            display: "flex",
            justifyContent: "center",
            margin: 0,
          }}
          className="progress"
        >
          <p
            style={{
              color: "white",
              margin: 0,
              // height: "100%",
              width: "auto",
              // position: "absolute",
              // top: "25%",
              // left: "50%",
            }}
          >
            {anaTotal ? Math.round((anaCompleted / anaTotal) * 100) : 0}%
          </p>
        </div>
      </div>
    )
  ) : (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: "rubik",
            fontSize: "3rem",
            textAlign: "center",
            marginBottom: 0,
          }}
        >
          {currText}
        </p>

        {preds ? (
          <>
            <p
              style={{
                fontFamily: "rubik",
                fontSize: "20px",
                color: "gray",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              Its ok if the detections are not spot on
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Button
                text="Yes"
                style={{ background: "#2fe05e", marginBottom: 10 }}
                callback={() => {
                  setAnalyzingReceipts(true);
                  const data = [];

                  separateReceipts(newPoints, state.img64).then(
                    async (imgs) => {
                      let count = 0;
                      setAnaTotal(imgs.images.length);

                      for (let img of imgs.images) {
                        let name = await getBusinessName(img.clean, count);

                        data.push({
                          Data: img.clean.split(",")[1],
                          Name: name.name + ".jpg",
                        });
                        count += 1;
                        setAnaCompleted(count);
                      }

                      completedData = data;
                    }
                  );
                }}
              />
              <Button
                text="No"
                style={{
                  background: "#eb3838",
                  paddingLeft: 32.5,
                  paddingRight: 32.5,
                  marginLeft: 20,

                  marginBottom: 10,
                }}
                callback={() => {
                  const pnts = [];
                  for (let receipt of preds.predictions) {
                    pnts.push(receipt.points);
                  }
                  navigate("/fix_way", {
                    state: {
                      img64: state.img64,
                      points: pnts,
                      imgData,
                    },
                  });
                }}
              />
            </div>

            <img src={detectionImage} />
          </>
        ) : null}
      </div>
    </>
  );
};

export default ConfirmReceiptCount;
