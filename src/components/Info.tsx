// Info.tsx
// 显示关于与致谢信息的对话框组件

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

// 定义 Props 类型
interface InfoProps {
  open: boolean;
  handleClose: () => void;
}

export default function Info({ open, handleClose}: InfoProps) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
            '& .MuiTypography-root': {
              fontFamily: 'JingNanBoBoHei, YurukaStd, "Microsoft YaHei", sans-serif',
            },
          }}
      >
        <DialogTitle id="alert-dialog-title">关于 & 致谢</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography variant="h6" component="h3">
              本项目
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/Micxelo/arcaea-stickers")}
                aria-label="打开本项目的 GitHub 页面"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="GitHub 仓库图标"
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  />
                </ListItemAvatar>
                <ListItemText primary="arcaea-stickers" secondary="Micxelo/arcaea-stickers" />
              </ListItem>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/Micxelo")}
                aria-label="打开项目开发者的 GitHub 页面"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Micxelo 的 GitHub 头像"
                    src="https://avatars.githubusercontent.com/Micxelo"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Micxelo"
                  secondary="项目开发者"
                />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3">
              本项目基于以下项目修改而来
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/TheOriginalAyaka/sekai-stickers")}
                aria-label="打开原项目的 GitHub 页面"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="GitHub 仓库图标"
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  />
                </ListItemAvatar>
                <ListItemText primary="sekai-stickers" secondary="TheOriginalAyaka/sekai-stickers" />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3">
              致谢
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/theoriginalayaka")}
                aria-label="打开 Ayaka 的 GitHub 页面"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Ayaka 的 GitHub 头像"
                    src="https://avatars.githubusercontent.com/theoriginalayaka"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Ayaka"
                  secondary="原项目的作者，提供了原始的想法和代码"
                />
              </ListItem>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/modder4869")}
                aria-label="打开 Modder4869 的 GitHub 页面"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Modder4869 的 GitHub 头像"
                    src="https://avatars.githubusercontent.com/modder4869"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Modder4869"
                  secondary="为代码提供帮助"
                />
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  (window.location.href =
                    "https://www.reddit.com/r/ProjectSekai/comments/x1h4v1/after_an_ungodly_amount_of_time_i_finally_made/")
                }
                aria-label="打开 SherenPlaysGames 在 Reddit 上的帖子"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="u/SherenPlaysGames 的 Reddit 头像"
                    src="https://styles.redditmedia.com/t5_mygft/styles/profileIcon_n1kman41j5891.jpg"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="u/SherenPlaysGames"
                  secondary="提供了原始的贴纸图像素材"
                />
              </ListItem>

              <ListItem
                button
                onClick={() =>
                  (window.location.href =
                    "https://github.com/TheOriginalAyaka/sekai-stickers/graphs/contributors")
                }
                aria-label="打开原项目的贡献者列表页面"
              >
                <ListItemAvatar>
                  <Avatar
                    alt="原项目的贡献者列表图标"
                    src="https://avatars.githubusercontent.com/in/29110"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="所有贡献者"
                  secondary="原项目的其他代码贡献者"
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              贴纸图像素材版权归原始游戏权利人所有。<br />
              本项目仅为粉丝创作，不用于商业用途。<br />
              如需贡献新贴纸，欢迎通过 GitHub 提交 Issue 或 PR。
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" autoFocus aria-label="关闭关于与致谢对话框">
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}