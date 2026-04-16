// ShortcutsHelp.tsx
// 显示快捷键帮助的对话框组件

import React, { useEffect, useState } from "react";
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

// 新的快捷键结构：一个描述对应多个组合键
interface ShortcutItem {
  desc: string;
  combinations: {
    mods: string[]; // 修饰键数组
    key: string;    // 主键
  }[];
}

// 快捷键数据定义
const shortcutsData: ShortcutItem[] = [
  { desc: "复制贴纸", combinations: [{ mods: ["Ctrl"], key: "C" }] },
  { desc: "下载贴纸", combinations: [{ mods: ["Ctrl"], key: "S" }] },
  { desc: "撤销", combinations: [{ mods: ["Ctrl"], key: "Z" }] },
  {
    desc: "恢复",
    combinations: [
      { mods: ["Ctrl"], key: "Y" },
      { mods: ["Ctrl", "Shift"], key: "Z" },
    ],
  },
  { desc: "重置当前角色默认值", combinations: [{ mods: ["Ctrl"], key: "R" }] },
  { desc: "微调文字位置 (1px)", combinations: [{ mods: [], key: "↑ ↓ ← →" }] },
  { desc: "移动文字位置 (5px)", combinations: [{ mods: ["Shift"], key: "↑ ↓ ← →" }] },
  { desc: "调整字号", combinations: [{ mods: [], key: "+ / -" }] },
  { desc: "旋转文字", combinations: [{ mods: [], key: "[ / ]" }] },
];

export default function ShortcutsHelp({ open, handleClose }: ShortcutsHelpProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const platform = window.navigator.userAgent.toLowerCase();
    setIsMac(platform.includes("mac"));
  }, []);

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
      <DialogTitle>键盘快捷键</DialogTitle>
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
        <Button onClick={handleClose} color="primary" autoFocus aria-label="关闭快捷键帮助">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
}