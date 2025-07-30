import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Box display="flex" gap={1}>
      <TextField
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a prompt..."
        onKeyUp={handleKeyUp}
        sx={{ '&:focus': { outline: 'none' } }}
      />
      <Button
        variant="contained"
        sx={{ bgcolor: "#800080", '&:focus': { outline: 'none' } }}
        tabIndex={0}
        onClick={handleSubmit}
      >
        <SendOutlinedIcon />
      </Button>
    </Box>
  );
}