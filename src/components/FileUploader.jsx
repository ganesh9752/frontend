import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  LinearProgress,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

export default function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const progressTimerRef = useRef(null);

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const handleFileUpload = (file) => {
    if (file.error) {
      setError(file.error);
      setErrorCode(file.error_code || "");
    } else {
      setError("");
      setErrorCode("");
      navigate(`/chat/${file.fileId}`);
    }
  };

  const startSimulatedProgress = () => {
    let progress = 0;
    progressTimerRef.current = setInterval(() => {
      progress += 1;
      setPercent(progress);
      if (progress >= 95) {
        clearInterval(progressTimerRef.current);
      }
    }, 100);
  };

  const completeProgress = () => {
    clearInterval(progressTimerRef.current);
    setPercent(100);
    setTimeout(() => {
      setIsUploading(false);
    }, 500); 
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    setIsUploading(true);
    setPercent(0);
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
        handleFileUpload({ name: file.name, fileId, ...res.data });
      } else {
        throw new Error(res.data.error_message || "Upload failed");
      }

      completeProgress();
    } catch (err) {
      clearInterval(progressTimerRef.current);
      console.error("Upload failed", err);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
      handleFileUpload({ name: file.name, error: err.message });
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(progressTimerRef.current);
    };
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
          <Box>
            {!isUploading ? (
              <>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display: "none" }}
                  id="file-upload"
                  onChange={handleChange}
                  disabled={isUploading}
                />
                <label htmlFor="file-upload">
                  <IconButton component="span" disabled={isUploading}>
                    <FileUploadOutlinedIcon
                      size="large"
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
              <Box sx={{ textAlign: "start"}}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems : "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "semi-bold" }}>
                      <CircularProgress size={20} width={2} rounded sx={{color: "#800080" }} /> 
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "semi-bold" }}>
                       Uploading PDF
                    </Typography>
                    </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "semi-bold" }}>
                    {percent}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  color="secondary"
                  value={percent}
                  sx={{ height: 8, borderRadius: 4 , color: "#800080" }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
