// src/QRScanner.js
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

function QRScanner({ onScan }) {
  const [lastScanned, setLastScanned] = useState(null);

  return (
    <div style={{
      textAlign: "center",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <h3>Scan Book QR</h3>

      <div style={{
        border: '3px dashed #273c75',
        borderRadius: '10px',
        padding: '5px',
        width: '90%',
        maxWidth: '400px'
      }}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              const code = result?.text;
              if (code !== lastScanned) {
                setLastScanned(code);
                onScan(code);
              }
            }
            if (!!error) console.log(error);
          }}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%" }}
        />
      </div>

      <p>Point your camera at the QR code on the book.</p>

      {lastScanned && (
        <button
          onClick={() => setLastScanned(null)}
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '5px',
            background: '#273c75',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Scan Another
        </button>
      )}
    </div>
  );
}

export default QRScanner;