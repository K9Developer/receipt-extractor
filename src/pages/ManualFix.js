import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fabric } from "fabric";
import "./manual_fix.css";
import Button from "../components/Button";

import sdel from "../assets/sdel.png";
import nsdel from "../assets/nsdel.png";

// http://jsfiddle.net/j2wz6tsh/2/ - For new matches
// https://chat.openai.com/share/f94b16d5-db53-4421-8368-f960babcf509 - For existing matches
// TODO: Make the predictions show as the rotated bounding box

let scaleFactor = 1.2;
let canvas = null;
let rect, isDown, origX, origY;
let rotateIcon;
let imgIcon;
const bgImageData = {
  orgWidth: 0,
  newWidth: 0,
  orgHeight: 0,
  newHeight: 0,
};

const svgRotateIcon = encodeURIComponent(`
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_d)">
    <circle cx="9" cy="9" r="5" fill="white"/>
    <circle cx="9" cy="9" r="4.75" stroke="black" stroke-opacity="0.3" stroke-width="0.5"/>
  </g>
    <path d="M10.8047 11.1242L9.49934 11.1242L9.49934 9.81885" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.94856 6.72607L8.25391 6.72607L8.25391 8.03142" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.69517 6.92267C10.007 7.03301 10.2858 7.22054 10.5055 7.46776C10.7252 7.71497 10.8787 8.01382 10.9517 8.33642C11.0247 8.65902 11.0148 8.99485 10.9229 9.31258C10.831 9.63031 10.6601 9.91958 10.4262 10.1534L9.49701 11.0421M8.25792 6.72607L7.30937 7.73554C7.07543 7.96936 6.90454 8.25863 6.81264 8.57636C6.72073 8.89408 6.71081 9.22992 6.78381 9.55251C6.8568 9.87511 7.01032 10.174 7.23005 10.4212C7.44978 10.6684 7.72855 10.8559 8.04036 10.9663" stroke="black" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
  <filter id="filter0_d" x="0" y="0" width="18" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
    <feOffset/>
    <feGaussianBlur stdDeviation="2"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.137674 0 0 0 0 0.190937 0 0 0 0 0.270833 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
  </filter>
  </defs>
</svg>
`);
const imgCursor = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24'>
    <defs>
      <filter id='a' width='266.7%' height='156.2%' x='-75%' y='-21.9%' filterUnits='objectBoundingBox'>
        <feOffset dy='1' in='SourceAlpha' result='shadowOffsetOuter1'/>
        <feGaussianBlur in='shadowOffsetOuter1' result='shadowBlurOuter1' stdDeviation='1'/>
        <feColorMatrix in='shadowBlurOuter1' result='shadowMatrixOuter1' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/>
        <feMerge>
          <feMergeNode in='shadowMatrixOuter1'/>
          <feMergeNode in='SourceGraphic'/>
        </feMerge>
      </filter>
      <path id='b' d='M1.67 12.67a7.7 7.7 0 0 0 0-9.34L0 5V0h5L3.24 1.76a9.9 9.9 0 0 1 0 12.48L5 16H0v-5l1.67 1.67z'/>
    </defs>
    <g fill='none' fill-rule='evenodd'><path d='M0 24V0h24v24z'/>
      <g fill-rule='nonzero' filter='url(#a)' transform='rotate(-90 9.25 5.25)'>
        <use fill='#000' fill-rule='evenodd' xlink:href='#b'/>
        <path stroke='#FFF' d='M1.6 11.9a7.21 7.21 0 0 0 0-7.8L-.5 6.2V-.5h6.7L3.9 1.8a10.4 10.4 0 0 1 0 12.4l2.3 2.3H-.5V9.8l2.1 2.1z'/>
      </g>
    </g>
  </svg>`);

const ManualFix = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(false);

  const renderIcon = (ctx, left, top, fabricObject) => {
    let size = 40;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(imgIcon, -size / 2, -size / 2, size, size);
    ctx.restore();
  };

  const resizePolygon = (polygon, scale) => {
    let resizedPolygon = [];
    for (let i = 0; i < polygon.length; i++) {
      let point = polygon[i];
      let newX = point.x * scale;
      let newY = point.y * scale;
      let resizedPoint = { x: newX, y: newY };
      resizedPolygon.push(resizedPoint);
    }
    return resizedPolygon;
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

  const drawExistingMatches = (canvasObj) => {
    for (let match of state.points) {
      let receiptPoints = match;
      let randomColor = generateRandomLightColor();
      let poly = new fabric.Polygon(
        resizePolygon(receiptPoints, scaleFactor),
        // resizePolygon(receiptPoints, 8),
        {
          fill: randomColor,
          hasControls: true,
          transparentCorners: false,
          stroke: darkenColor(randomColor, -10).slice(0, 7),
          strokeWidth: 4,
        }
      );
      poly.perPixelTargetFind = true;

      canvasObj.add(poly);
    }
    canvasObj.renderAll();
  };

  const generateBackgroundImage = () => {
    // if (!tmpCanvas) {
    //   tmpCanvas = document.createElement("canvas");
    // }
    // if (!tmpCtx) {
    //   tmpCtx = tmpCanvas.getContext("2d");
    // }
    // tmpCanvas.width = window.innerWidth * 0.8;
    // tmpCanvas.height = window.innerHeight * 0.8;
    let background = new Image();
    background.src = state.img64;

    // Make sure the image is loaded first otherwise nothing will draw.
    background.onload = () => {
     
      let bg = new fabric.Image(background);

      // let ratio = Math.min(hRatio, vRatio);
      let ratio = (600 / bg.height) * scaleFactor;
      console.log((bg.height * ratio)/(bg.width * ratio), bg.height / bg.width, window.innerWidth)
      
      canvas.setDimensions({
        width: bg.width * ratio,
        height: bg.height * ratio,
      });
      bg.scaleToWidth(canvas.width * 2);
      bg.scaleToHeight(canvas.height);
      // bg.width = canvas.width;
      // bg.height = canvas.height;
      canvas.setBackgroundImage(bg, canvas.renderAll.bind(canvas), {});
      // for (let obj of canvas.getObjects()) {
      //   canvas.remove(obj)
      // }
      drawExistingMatches(canvas);
    };
  };

  // useEffect(() => {
  //   if (canvas?.backgroundImage) {
  //     drawExistingMatches(canvas)
  //   }
  // }, [canvas]);

  useEffect(() => {
    canvas = new fabric.Canvas("c", { selection: true });

    rotateIcon = `data:image/svg+xml;utf8,${svgRotateIcon}`;
    imgIcon = document.createElement("img");

    canvas.on({
      "selection:updated": (e) => {
        const activeSelection = e.target;
        if (activeSelection) {
          canvas.discardActiveObject();
        }
      },
    });

    // canvas.on('mouse:over', function(e) {

    //   if (e.target) e.target.set('fill', 'red');
    //   canvas.renderAll();
    // });

    canvas.on("selection:created", () => {
      setSelected(true);
    });

    canvas.on("selection:cleared", () => {
      setSelected(false);
    });

    fabric.Group.prototype.hasControls = false;
    imgIcon.src = rotateIcon;
    fabric.Object.prototype.controls.mtr = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 0,
      offsetY: -30,
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: "rotate",
      render: renderIcon,
      cornerSize: 38,
      withConnection: true,
      cursorStyle: `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 12 12, crosshair`,
    });

    generateBackgroundImage();

    document.addEventListener("keydown", function (event) {
      const key = event.key; // "a", "1", "Shift", etc.
      if (key == "Delete") {
        removeObject();
      }
    });
    canvas.on("mouse:down", function (o) {
      if (o.target) return;
      isDown = true;
      let pointer = canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      pointer = canvas.getPointer(o.e);
      let color = generateRandomLightColor();

      rect = new fabric.Rect({
        left: origX,
        top: origY,
        originX: "left",
        originY: "top",
        width: pointer.x - origX,
        height: pointer.y - origY,
        angle: 0,
        fill: color,
        transparentCorners: false,
        // stroke: darkenColor(color, -10).slice(0, 7),
        // strokeWidth: 4,
      });
      rect.controls.mtr.offsetY = -20;
      rect.perPixelTargetFind = true;

      canvas.add(rect);
    });

    canvas.on("mouse:move", function (o) {
      if (!isDown) return;
      let pointer = canvas.getPointer(o.e);

      if (origX > pointer.x) {
        rect.set({
          left: Math.abs(pointer.x),
        });
      }
      if (origY > pointer.y) {
        rect.set({
          top: Math.abs(pointer.y),
        });
      }

      rect.set({
        width: Math.abs(origX - pointer.x),
      });
      rect.set({
        height: Math.abs(origY - pointer.y),
      });

      canvas.renderAll();
    });

    canvas.on("mouse:up", function (o) {
      if (rect && rect.width * rect.height < 1500) {
        canvas.remove(rect);
      }
      isDown = false;
    });
    // window.addEventListener("resize", () => generateBackgroundImage(), false);
  }, []);

  // TODO:
  // 1. When reading business name, order all text by Y position first, so I read it from the top to bottom.
  // 2. Fix the seperate receipts

  const confirm = () => {
    const receipts = [];
    for (let obj of canvas.getObjects()) {
      if (obj.type == "polygon") {
        let bbox = obj.getBoundingRect();
        receipts.push({
          points: resizePolygon(obj.points, 1 / scaleFactor),
          width: bbox.width * (1 / scaleFactor),
          height: bbox.height * (1 / scaleFactor),
          pos: {
            x: (bbox.left + bbox.width / 2) * (1 / scaleFactor),
            y: (bbox.top + bbox.height / 2) * (1 / scaleFactor),
          },
        });
      } else {
        let bbox = obj.getBoundingRect();
        receipts.push({
          points: resizePolygon(obj.getCoords(), 1 / scaleFactor),
          width: bbox.width * (1 / scaleFactor),
          height: bbox.height * (1 / scaleFactor),
          pos: {
            x: (bbox.left + bbox.width / 2) * (1 / scaleFactor),
            y: (bbox.top + bbox.height / 2) * (1 / scaleFactor),
          },
        });
      }
    }
    // const newReceipts = []
    // for (let receipt of receipts) {
    //   newReceipts.push({points:receipt})
    // }

    navigate("/confirm_receipt", {
      state: { img64: state.img64, receipts, imgData: state.imgData },
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
      "9E";
    return hex;
  };

  const removeObject = () => {
    canvas.getActiveObjects().forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject().renderAll();
  };

  return (
    <>
      <div id="total-container">
        <div id="ct-container">
          {/* <canvas id="canvas"></canvas>   */}
          <p id="guide">
            Drag and release to create a bounding box, Make sure the bounding
            box includes the whole receipt
          </p>
          <div id="c-container">
            <canvas id="c" style={{ width: "100%", height: "100vh" }}></canvas>
            <div id="tools">
              {selected ? (
                <img id="sdel" src={sdel} onClick={removeObject} />
              ) : (
                <img id="nsdel" src={nsdel} />
              )}
            </div>
          </div>
        </div>
        <Button
          id="done"
          text="Done"
          style={{
            width: "15%",
            marginTop: "10px",
          }}
          callback={confirm}
        />
      </div>
    </>
  );
};

export default ManualFix;
