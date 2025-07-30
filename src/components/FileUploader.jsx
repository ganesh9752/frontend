import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [uploadFinished, setUploadFinished] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const navigate = useNavigate();
  const progressTimerRef = useRef(null);
  const progressValueRef = useRef(0);

  useEffect(() => {
    if (uploadFinished && responseReceived && fileInfo) {
      setTimeout(() => {
        navigate(`/chat/${fileInfo.fileId}`);
      }, 500); 
    }
  }, [uploadFinished, responseReceived, fileInfo, navigate]);

  const startSimulatedProgress = () => {
    let progress = 0;
    progressValueRef.current = 0;
    progressTimerRef.current = setInterval(() => {
      progress += 1;
      progressValueRef.current = progress;
      setPercent(progress);
      if (progress >= 95) {
        clearInterval(progressTimerRef.current);
        slowProgressTo100();
      }
    }, 100);
  };

  const slowProgressTo100 = () => {
    progressTimerRef.current = setInterval(() => {
      if (progressValueRef.current < 100) {
        progressValueRef.current += 1;
        setPercent(progressValueRef.current);
      } else {
        clearInterval(progressTimerRef.current);
        setUploadFinished(true);
      }
    }, 300);
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    setIsUploading(true);
    setPercent(0);
    setError("");
    setErrorCode("");
    setUploadFinished(false);
    setResponseReceived(false);
    setFileInfo(null);

    startSimulatedProgress();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_LLAMAPARSE_API_KEY}`,
          },
        }
      );

      if (res.data?.status === "SUCCESS") {
        const fileId = res.data.fileId || Date.now();
        setFileInfo({ name: file.name, fileId, ...res.data });
        setResponseReceived(true);
      } else {
        throw new Error(res.data.error_message || "Upload failed");
      }
    } catch (err) {
      clearInterval(progressTimerRef.current);
      console.error("Upload failed", err);
      setError(err.message);
      setErrorCode(err.response?.data?.error_code || "");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => clearInterval(progressTimerRef.current);
  }, []);

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
          {errorCode && (
            <>
              <br />
              Error Code: {errorCode}
            </>
          )}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "98vh",
        }}
      >
        <Box
          sx={{
            width: "500px",
            padding: "40px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
            borderRadius: "10px",
            backgroundColor: "#fff",
            textAlign: "center",
          }}
        >
          {!isUploading ? (
            <>
              <input
                type="file"
                accept=".pdf,.docx"
                style={{ display: "none" }}
                id="file-upload"
                onChange={handleChange}
              />
              <label htmlFor="file-upload">
                <IconButton component="span">
                  <FileUploadOutlinedIcon
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "50%",
                      padding: "8px",
                      color: "#800080",
                      width: "35px",
                      height: "35px",
                    }}
                  />
                </IconButton>
              </label>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Upload PDF to start chatting
              </Typography>
            </>
          ) : (
            <Box sx={{ textAlign: "start" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {uploadFinished && !responseReceived ? (
                    <HourglassTopIcon sx={{ color: "#800080" }} />
                  ) : (
                    <CircularProgress size={20} sx={{ color: "#800080" }} />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: "semi-bold" }}>
                    {uploadFinished && !responseReceived
                      ? "Finalizing..."
                      : "Uploading PDF"}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "semi-bold" }}>
                  {percent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                color="secondary"
                value={percent}
                sx={{ height: 8, borderRadius: 4, mt: 1 }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
