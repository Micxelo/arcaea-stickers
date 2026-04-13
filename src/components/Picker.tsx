// src/components/Picker.tsx
import {
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  ImageList,
  ImageListItem,
  Typography,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useMemo } from "react";
import characters from "../characters.json";

interface Character {
  id: string;
  name: string;
  character: string;
  img: string;
  color: string;
  strokeColor?: string;
  defaultText: {
    text: string;
    x: number;
    y: number;
    size: number;
    rotate: number;
  };
}

interface PickerProps {
  setCharacter: (index: number) => void;
}

export default function Picker({ setCharacter }: PickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredItems = useMemo(() => {
    const s = search.toLowerCase().trim();
    return (characters as Character[]).map((c, index) => {
      const match =
        s === c.id ||
        c.name.toLowerCase().includes(s) ||
        c.character.toLowerCase().includes(s);
      if (!match) return null;
      return (
        <ImageListItem
          key={index}
          onClick={() => {
            handleClose();
            setCharacter(index);
          }}
          sx={{
            cursor: "pointer",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            "&:hover": { opacity: 0.5 },
            "&:active": { opacity: 0.8 },
          }}
        >
          <img
            src={`/img/${c.img}`}
            srcSet={`/img/${c.img}`}
            alt={c.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </ImageListItem>
      );
    });
  }, [search, setCharacter]);

  const validItems = filteredItems.filter(item => item !== null);

  return (
    <>
      <IconButton color="secondary" onClick={handleOpen}>
        <SearchIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100%',
            minWidth: 360,
            maxWidth: 500,
            margin: 16,
            '@media (max-width: 600px)': {
              maxWidth: '90vw',
              minWidth: '90vw',
            },
          }
        }}
        // 点击背景或按 ESC 自动关闭
      >
        <DialogContent dividers sx={{ p: 0, overflowX: "hidden" }}>
          <div className="picker-search" style={{ padding: "0.5rem" }}>
            <TextField
              label="搜索角色"
              size="small"
              color="secondary"
              value={search}
              fullWidth
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="image-grid-wrapper" style={{ overflowX: "hidden", width: "100%" }}>
            {validItems.length === 0 ? (
              <Box 
                sx={{ 
                  width: '100%', 
                  minHeight: 450,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Typography color="textSecondary">未找到相关角色</Typography>
              </Box>
            ) : (
              <ImageList
                sx={{
                  width: "100%",
                  height: 450,
                  overflowX: "hidden",
                  overflowY: "auto",
                  margin: 0,
                }}
                cols={4}
                rowHeight="auto"
                gap={8}
                className="image-grid"
              >
                {filteredItems}
              </ImageList>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}