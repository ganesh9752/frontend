import React from "react";
import FileUploader from "../components/FileUploader";
import { Box } from "@mui/material";

export default function HomePage() {
 

  return (
    <Box sx={{ backgroundColor: "#f5f5f5" }}>
      <FileUploader />
    </Box>
  );
}
