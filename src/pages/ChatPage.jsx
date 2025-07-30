import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import ChatInput from "../components/ChatInput";
import DocumentViewer from "../components/DocumentViewer";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

export default function ChatPage() {
  const { id: fileId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: "bot",
        text: `**Your document is ready!**

You can now ask questions about your document. For example:

- "What is the main topic of this document?"
- "Can you summarize the key points?"
- "What are the conclusions or recommendations?"`,
      },
    ]);
  }, []);

  const handleSend = async (text) => {
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/prompt`, {
        prompt: text,
        fileName: fileId,
      });

      const botMsg = { role: "bot", text: res.data.data };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    } catch (err) {
      console.error("Chat error:", err);
      setLoading(false);
    }
  };

  return (
    <Box display="flex" height="100vh">
      <Paper
        sx={{
          width: "40%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #ccc",
          overflow: "auto",
        }}
      >
        <Box flexGrow={1} sx={{ mb: 2, overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              {msg.role === "user" ? (
                <Box sx={{ marginRight: 1 }}>
                  <Person2OutlinedIcon />
                  <Paper
                    elevation={1}
                    sx={{
                      backgroundColor: "#e3f2fd",
                      padding: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ marginRight: 1 }}>
                  <SmartToyOutlinedIcon />
                  <Paper
                    elevation={1}
                    sx={{
                      backgroundColor: "#f5f5f5",
                      padding: 2,
                      borderRadius: 2,
                      overflowX: "auto",
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        h3: ({ node, ...props }) => (
                          <Typography variant="h6" gutterBottom {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <Typography variant="body1" paragraph {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            style={{
                              marginLeft: "1.5rem",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="span"
                              {...props}
                            />
                          </li>
                        ),
                        strong: ({ node, ...props }) => (
                          <strong style={{ fontWeight: 600 }} {...props} />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </Paper>
                </Box>
              )}
            </Box>
          ))}

          {loading && (
            <Box sx={{ textAlign: "center", padding: 2 }}>
              <Typography variant="body1">
                {" "}
                <CircularProgress size={20} sx={{ mr: 1, color: "#800080" }} />
                Getting response
              </Typography>
            </Box>
          )}
        </Box>

        <ChatInput onSend={handleSend} />
      </Paper>

      <Box sx={{ width: "60%", p: 2 }}>
        <DocumentViewer fileId={fileId} />
      </Box>
    </Box>
  );
}
