// main.tsx

import React, {useMemo} from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from '@mui/material/useMediaQuery';

import "./index.css";
import App from "./App";

function Root() {
  // 监听系统是否处于深色模式
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // 根据 prefersDarkMode 动态创建主题
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(<Root />);