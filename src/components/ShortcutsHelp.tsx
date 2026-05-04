// ShortcutsHelp.tsx
// 显示快捷键帮助的对话框组件

import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// 样式化按键组件
const Kbd = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="kbd"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      height: '20px',
      padding: '0 6px',
      fontSize: '0.85rem',
      fontWeight: 'bold',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#374151',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      boxShadow: '0 2px 0 #d1d5db',
      mx: '2px',
      position: 'relative',
      top: '-1px'
    }}
  >
    {children}
  </Box>
);

interface ShortcutsHelpProps {
  open: boolean;
  handleClose: () => void;
}

// 定义快捷键项的类型
interface ShortcutItem {
  desc: string;
  combinations: {
    mods: string[]; // 修饰键数组
    key: string;    // 主键
  }[];
}

export default function ShortcutsHelp({ open, handleClose }: ShortcutsHelpProps) {
  const { t } = useTranslation();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const platform = window.navigator.userAgent.toLowerCase();
    setIsMac(platform.includes("mac"));
  }, []);

  // 快捷键数据定义
  const shortcutsData: ShortcutItem[] = [
    { desc: t('shortcutsHelp.shortcuts.copy'), combinations: [{ mods: ["Ctrl"], key: "C" }] },
    { desc: t('shortcutsHelp.shortcuts.download'), combinations: [{ mods: ["Ctrl"], key: "S" }] },
    { desc: t('shortcutsHelp.shortcuts.undo'), combinations: [{ mods: ["Ctrl"], key: "Z" }] },
    {
      desc: t('shortcutsHelp.shortcuts.redo'),
      combinations: [
        { mods: ["Ctrl"], key: "Y" },
        { mods: ["Ctrl", "Shift"], key: "Z" },
      ],
    },
    { desc: t('shortcutsHelp.shortcuts.reset'), combinations: [{ mods: ["Ctrl"], key: "R" }] },
    { desc: t('shortcutsHelp.shortcuts.move1px'), combinations: [{ mods: [], key: "↑ ↓ ← →" }] },
    { desc: t('shortcutsHelp.shortcuts.move5px'), combinations: [{ mods: ["Shift"], key: "↑ ↓ ← →" }] },
    { desc: t('shortcutsHelp.shortcuts.fontSize'), combinations: [{ mods: [], key: "+ / -" }] },
    { desc: t('shortcutsHelp.shortcuts.rotate'), combinations: [{ mods: [], key: "[ / ]" }] },
  ];

  // 格式化修饰键
  const formatMod = (m: string) => {
    if (m === "Ctrl") return isMac ? "⌘" : "Ctrl";
    if (m === "Shift") return isMac ? "⇧" : "Shift";
    return m;
  };

  // 渲染单个组合键
  const renderCombination = (combo: { mods: string[]; key: string }) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
      {combo.mods.map((mod, i) => (
        <React.Fragment key={i}>
          <Kbd>{formatMod(mod)}</Kbd>
          <Typography sx={{ fontSize: '0.8rem', opacity: 0.5, mx: 0.2 }}>+</Typography>
        </React.Fragment>
      ))}
      <Kbd>{combo.key}</Kbd>
    </Box>
  );

  // 渲染快捷键行
  const renderShortcutRow = (item: ShortcutItem) => {
    const combos = item.combinations.map((combo, idx) => (
      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {renderCombination(combo)}
      </Box>
    ));
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>  {/* gap 控制垂直间距 */}
        {combos}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiTypography-root, & .MuiTableCell-root": {
          fontFamily: 'JingNanBoBoHei, YurukaStd, "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <DialogTitle>{t('shortcutsHelp.dialog.title')}</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableBody>
              {shortcutsData.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ py: 1.5, width: '50%' }}>
                    {renderShortcutRow(item)}
                  </TableCell>
                  <TableCell align="left">{item.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus aria-label={t('shortcutsHelp.closeButton.ariaLabel')}>
          {t('shortcutsHelp.closeButton.text')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}