import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
} from "@mui/material";

export default function DocumentViewer({ fileId }) {
  const decoded = decodeURIComponent(fileId);
  const filename = `${decoded}.pdf`;
  const pdfUrl = `${import.meta.env.VITE_BACKEND_URL}/uploads/${encodeURIComponent(
    filename
  )}`;

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const [loadingVisible, setLoadingVisible] = useState(true);

  const lingerTimer = useRef(null);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    axios
      .get(pdfUrl, {
        responseType: "blob",
        cancelToken: cancelToken.token,
        onDownloadProgress: (evt) => {
          if (evt.total) {
            setDownloadProgress(
              Math.round((evt.loaded * 100) / evt.total)
            );
          }
        },
      })
      .then((res) => {
        setPdfBlobUrl(URL.createObjectURL(res.data));
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error("Download error:", err);
        }
      });

    return () => {
      cancelToken.cancel();
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfBlobUrl && iframeLoaded) {
      clearTimeout(lingerTimer.current);
      lingerTimer.current = setTimeout(() => {
        setLoadingVisible(false);
      }, 800);
    }
    return () => clearTimeout(lingerTimer.current);
  }, [pdfBlobUrl, iframeLoaded]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      clearTimeout(lingerTimer.current);
    };
  }, [pdfBlobUrl]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {loadingVisible && (
        <Box
          sx={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            zIndex: 2,
          }}
        >
          <Typography sx={{ mb: 1 }}>
            Loading PDF… {downloadProgress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            color="secondary"
            value={downloadProgress}
            sx={{ height: 8, borderRadius: 4 , color: "#800080" }}
          />
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }}>
        {pdfBlobUrl && (
          <iframe
            src={pdfBlobUrl}
            title={filename}
            style={{ width: "100%", height: "100%", border: "none" }}
            onLoad={() => setIframeLoaded(true)}
          />
        )}
      </Box>
    </Paper>
  );
}
