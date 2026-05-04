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
import { Trans, useTranslation } from 'react-i18next';

// 定义 Props 类型
interface InfoProps {
  open: boolean;
  handleClose: () => void;
}

export default function Info({ open, handleClose}: InfoProps) {
  const { t } = useTranslation();

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
        <DialogTitle id="alert-dialog-title">{t('info.dialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography variant="h6" component="h3">
              {t('info.sections.project')}
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/Micxelo/arcaea-stickers")}
                aria-label={t('info.items.projectRepo.ariaLabel')}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={t('info.items.projectRepo.avatarAlt')}
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  />
                </ListItemAvatar>
                <ListItemText primary={t('info.items.projectRepo.primary')} secondary={t('info.items.projectRepo.secondary')} />
              </ListItem>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/Micxelo")}
                aria-label={t('info.items.developer.ariaLabel')}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={t('info.items.developer.avatarAlt')}
                    src="https://avatars.githubusercontent.com/Micxelo"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={t('info.items.developer.primary')}
                  secondary={t('info.items.developer.secondary')}
                />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3">
              {t('info.sections.basedOn')}
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/TheOriginalAyaka/sekai-stickers")}
                aria-label={t('info.items.originalRepo.ariaLabel')}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={t('info.items.originalRepo.avatarAlt')}
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  />
                </ListItemAvatar>
                <ListItemText primary={t('info.items.originalRepo.primary')} secondary={t('info.items.originalRepo.secondary')} />
              </ListItem>
            </List>

            <Typography variant="h6" component="h3">
              {t('info.sections.thanks')}
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/theoriginalayaka")}
                aria-label={t('info.items.ayaka.ariaLabel')}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={t('info.items.ayaka.avatarAlt')}
                    src="https://avatars.githubusercontent.com/theoriginalayaka"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={t('info.items.ayaka.primary')}
                  secondary={t('info.items.ayaka.secondary')}
                />
              </ListItem>
              <ListItem
                button
                onClick={() => (window.location.href="https://github.com/modder4869")}
                aria-label={t('info.items.modder4869.ariaLabel')}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={t('info.items.modder4869.avatarAlt')}
                    src="https://avatars.githubusercontent.com/modder4869"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={t('info.items.modder4869.primary')}
                  secondary={t('info.items.modder4869.secondary')}
                />
              </ListItem>

              <ListItem
                button
                onClick={() =>
                  (window.location.href =
                    "https://github.com/TheOriginalAyaka/sekai-stickers/graphs/contributors")
                }
                aria-label={t('info.items.allContributors.ariaLabel')}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={t('info.items.allContributors.avatarAlt')}
                    src="https://avatars.githubusercontent.com/in/29110"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={t('info.items.allContributors.primary')}
                  secondary={t('info.items.allContributors.secondary')}
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              <Trans i18nKey="info.copyright" components={{ br: <br /> }} />
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" autoFocus aria-label={t('info.closeButton.ariaLabel')}>
            {t('info.closeButton.text')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}