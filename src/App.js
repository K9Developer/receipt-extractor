import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ReceiptUploader from './pages/ReceiptUploader';
import WebcamScreenshot from './pages/WebcamScreenshot';
import WebcamConfirm from './pages/WebcamConfirm';
import FileConfirm from './pages/FileConfirm';
import ConfirmReceiptCount from './pages/ConfirmReceiptCount';
import DownloadZip from './pages/DownloadZip';
import NoStep from './pages/NoStep';
import ManualFix from './pages/ManualFix';


export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/uploader" element={<ReceiptUploader />} />
        <Route path="/webcam" element={<WebcamScreenshot />} />
        <Route path="/confirm_webcam" element={<WebcamConfirm />} />
        <Route path="/confirm_file" element={<FileConfirm />} />
        <Route path="/confirm_receipt" element={<ConfirmReceiptCount />} />
        <Route path="/download_receipts" element={<DownloadZip />} />
        <Route path="/fix_way" element={<NoStep />} />
        <Route path="/manual" element={<ManualFix />} />
      </Routes>
    </div>
  );
}