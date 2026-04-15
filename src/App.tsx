import "./App.css";
import Canvas from "./components/Canvas";
import { useState, useEffect, useRef } from "react";
import characters from "./characters.json";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import IconButton from '@mui/material/IconButton';
import Picker from "./components/Picker";
import Info from "./components/Info";

import GitHubIcon from '@mui/icons-material/GitHub';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ShareIcon from '@mui/icons-material/Share';

interface Character {
  id: string;
  name: string;
  character: string;
  img: string;
  color: string;
  strokeColor: string;
  extraColor?: string;        // 存在时视为右侧文字颜色
  extraStrokeColor?: string;  // 存在时视为右侧文字描边颜色
  defaultText: {
    text: string;
    x: number;
    y: number;
    rotate: number;
    arcRadius?: number;       // 存在且为正数时视为弧形文字半径
    convex?: boolean;         // 弧形文字是否向上凸出（true 为上凸）
    size: number;
  };
}

// 断言导入的 JSON 符合 Character[] 类型
const typedCharacters = characters as Character[];

const { ClipboardItem } = window;

const CANVAS_CONFIG = {
  // 原图片尺寸
  width: 512,
  height: 512,

  // 输出贴纸尺寸
  outputWidth: 296,
  outputHeight: 256,
};

const STROKE_CONFIG = {
  outerWidth: 18,             // 外圈描边宽度
  innerWidth: 7,              // 内圈描边宽度
  defaultColor: "#000000",  // 默认内圈描边颜色
};

const FONT_CONFIG = {
  defaultFontFamily: "JingNanBoBoHei", // 默认字体
  fallbackFonts: ["YurukaStd", "Microsoft YaHei", "sans-serif"], // 字体回退列表
};

// 历史记录快照
interface CanvasStateSnapshot {
  character: number;
  text: string;
  fontSize: number;
  spaceSize: number;
  rotate: number;
  position: { x: number; y: number };
  curve: boolean;
  arcRadius: number;
  convex: boolean;
  bgColorEnabled: boolean;
  bgColor: string;
  textColor: string;
  strokeColor: string;
  extraColorEnabled: boolean;
  extraColor: string;
  extraStrokeColor: string;
}

async function loadFont(family: string, url: string): Promise<boolean> {
  try {
    // 如果字体未注册，则加载
    if (!document.fonts.check(`12px ${family}`)) {
      const font = new FontFace(family, `url(${url})`);
      await font.load();
      document.fonts.add(font);
    }
    // 等待所有字体加载和解码完成
    await document.fonts.ready;
    console.log(`字体 "${family}" 加载成功`);
    return true;
  } catch (error) {
    console.error(`字体 "${family}" 加载失败:`, error);
    return false;
  }
}

function App() {
  const [infoOpen, setInfoOpen] = useState(false);
  const handleClickOpen= () => setInfoOpen(true);
  const handleClose = () => setInfoOpen(false);

  const [character, setCharacter] = useState(2); // 默认角色（Hikari）
  const [text, setText] = useState(typedCharacters[character].defaultText.text);
  const [fontSize, setFontSize] = useState<number>(typedCharacters[character].defaultText.size);
  const [spaceSize, setSpaceSize] = useState<number>(50);
  const [rotate, setRotate] = useState<number>(typedCharacters[character].defaultText.rotate);
  const [position, setPosition] = useState({
    x: typedCharacters[character].defaultText.x,
    y: typedCharacters[character].defaultText.y,
  });

  // 弧形文字
  const initialArcRadius = typedCharacters[character].defaultText.arcRadius;
  const initialCurve = initialArcRadius !== undefined && initialArcRadius > 0;

  const [curve, setCurve] = useState<boolean>(initialCurve);
  const [arcRadius, setArcRadius] = useState<number>(initialCurve ? initialArcRadius : 200);
  const [convex, setConvex] = useState<boolean>(
    typedCharacters[character].defaultText.convex ?? true
  );

  // 自定义背景颜色
  const [bgColorEnabled, setBgColorEnabled] = useState(false); // 使用透明背景
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  // 默认文字颜色
  const [textColor, setTextColor] = useState<string>(typedCharacters[character].color);
  const [strokeColor, setStrokeColor] = useState<string>(typedCharacters[character].strokeColor || STROKE_CONFIG.defaultColor);

  // 右侧文字颜色
  const [extraColorEnabled, setExtraColorEnabled] = useState<boolean>(false);
  const [extraColor, setExtraColor] = useState<string>(typedCharacters[character].extraColor || typedCharacters[character].color);
  const [extraStrokeColor, setExtraStrokeColor] = useState<string>(typedCharacters[character].extraStrokeColor || (typedCharacters[character].strokeColor || STROKE_CONFIG.defaultColor));

  // 图片状态
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  // 历史记录状态
  const [historyData, setHistoryData] = useState<{ list: CanvasStateSnapshot[], index: number }>({
    list: [],
    index: -1,
  });
  const isUndoRedoRef = useRef(false); // 标记当前的状态变化是否由“撤销/恢复”按钮引起的

  const img = new Image();

  // 组件挂载时加载字体
  useEffect(() => {
    Promise.all([
      loadFont(FONT_CONFIG.defaultFontFamily, "/fonts/JingNanBoBoHei.ttf"),
      loadFont("YurukaStd", "/fonts/YurukaStd.otf")
    ]).then(() => setFontLoaded(true));
  }, []);

  // 切换角色时重置状态
  useEffect(() => {
    // 撤销/恢复操作触发的角色切换不重置状态
    if (isUndoRedoRef.current) return;

    const curr = typedCharacters[character];
    setText(curr.defaultText.text);
    setPosition({
      x: curr.defaultText.x,
      y: curr.defaultText.y,
    });
    setRotate(curr.defaultText.rotate);
    setFontSize(curr.defaultText.size);
    setTextColor(curr.color);
    setStrokeColor(curr.strokeColor || STROKE_CONFIG.defaultColor);

    // 处理弧形文字
    const newArcRadius = curr.defaultText.arcRadius;
    const newCurve = newArcRadius !== undefined && newArcRadius > 0;
    setCurve(newCurve);
    setArcRadius(newCurve ? newArcRadius : 200);
    setConvex(curr.defaultText.convex ?? true);

    // 处理附加颜色
    if (curr.extraColor && curr.extraStrokeColor) {
      setExtraColorEnabled(true);
      setExtraColor(curr.extraColor);
      setExtraStrokeColor(curr.extraStrokeColor);
    } else {
      setExtraColorEnabled(false);
      setExtraColor(curr.color);
      setExtraStrokeColor(curr.strokeColor || STROKE_CONFIG.defaultColor);
    }

    setSpaceSize(50);
    setImgLoaded(false);
  }, [character]);

  // 统一打包当前状态
  const currentState: CanvasStateSnapshot = {
    character, text, fontSize, spaceSize, rotate, position,
    curve, arcRadius, convex, bgColorEnabled, bgColor,
    textColor, strokeColor, extraColorEnabled, extraColor, extraStrokeColor
  };

  // 批量应用某个历史状态
  const applySnapshot = (state: CanvasStateSnapshot) => {
    setCharacter(state.character);
    setText(state.text);
    setFontSize(state.fontSize);
    setSpaceSize(state.spaceSize);
    setRotate(state.rotate);
    setPosition(state.position);
    setCurve(state.curve);
    setArcRadius(state.arcRadius);
    setConvex(state.convex);
    setBgColorEnabled(state.bgColorEnabled);
    setBgColor(state.bgColor);
    setTextColor(state.textColor);
    setStrokeColor(state.strokeColor);
    setExtraColorEnabled(state.extraColorEnabled);
    setExtraColor(state.extraColor);
    setExtraStrokeColor(state.extraStrokeColor);
  };

  // 监听状态变化，防抖 300ms 后推入历史记录
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false; // 消费掉标记，放行后续的用户正常操作
      return;
    }

    const timer = setTimeout(() => {
      setHistoryData(prev => {
        // 丢弃当前所在索引之后的历史
        const currentSlice = prev.list.slice(0, prev.index + 1);
        const lastState = currentSlice[currentSlice.length - 1];

        // 状态没有任何变化，直接跳过
        if (lastState && JSON.stringify(lastState) === JSON.stringify(currentState)) {
          return prev;
        }

        const newList = [...currentSlice, currentState];
        // 限制在 30 步以内
        if (newList.length > 30) newList.shift();

        return { list: newList, index: newList.length - 1 };
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    character, text, fontSize, spaceSize, rotate, position.x, position.y,
    curve, arcRadius, convex, bgColorEnabled, bgColor,
    textColor, strokeColor, extraColorEnabled, extraColor, extraStrokeColor
  ]);

  const handleUndo = () => {
    setHistoryData(prev => {
      if (prev.index > 0) {
        const newIndex = prev.index - 1;
        isUndoRedoRef.current = true; // 标记本次状态改变是由撤销发起的
        applySnapshot(prev.list[newIndex]);
        return { ...prev, index: newIndex };
      }
      return prev;
    });
  };

  const handleRedo = () => {
    setHistoryData(prev => {
      if (prev.index < prev.list.length - 1) {
        const newIndex = prev.index + 1;
        isUndoRedoRef.current = true; // 标记本次状态改变是由恢复发起的
        applySnapshot(prev.list[newIndex]);
        return { ...prev, index: newIndex };
      }
      return prev;
    });
  };

  // 分享
  const handleShare = async () => {
    if (!navigator.share)
      return;

    const canvas = document.getElementsByTagName("canvas")[0];
    if (!canvas)
      return;

    canvas.toBlob(async (blob) => {
      if (!blob)
        return;

      // 生成与下载类似的文件名
      const fileName = `${typedCharacters[character].name}_${text.substring(0, 10)}_arcst.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const shareData = {
        title: "Arcaea 贴纸",
        text: `这是我用 Arcaea 贴纸生成器 制作的 ${typedCharacters[character].name} 贴纸！`,
        url: "https://arcst.micxelo.moe",
        files: [file],
      };

      // 检查当前设备/浏览器是否支持分享
      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          // 用户取消分享
          console.log("分享操作已结束或取消:", error);
        }
      } else {
        alert("您的浏览器不支持直接分享图片文件，请使用下载或复制功能。");
      }
    }, "image/png");
  };

  img.src = "/img/" + typedCharacters[character].img;
  img.onload = () => {
    setImgLoaded(true);
  };

  const draw = async (ctx: CanvasRenderingContext2D) => {
    ctx.canvas.width = CANVAS_CONFIG.outputWidth;
    ctx.canvas.height = CANVAS_CONFIG.outputHeight;

    if (!imgLoaded || !fontLoaded)
      return;

    try {
      await document.fonts.load(`${fontSize}px ${FONT_CONFIG.defaultFontFamily}`, text);
    } catch (error) {
      console.warn('字体加载失败，继续使用默认字体绘制', error);
    }

    var hRatio = ctx.canvas.width / img.width;
    var vRatio = ctx.canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (ctx.canvas.width - img.width * ratio) / 2;
    var centerShift_y = (ctx.canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 绘制背景颜色
    if (bgColorEnabled) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );

    ctx.font = `${fontSize}px '${FONT_CONFIG.defaultFontFamily}', ${FONT_CONFIG.fallbackFonts.map(f => `'${f}'`).join(', ')}`;
    ctx.lineWidth = 9;
    ctx.save();

    ctx.translate(position.x, position.y);
    ctx.rotate(rotate / 10);
    ctx.textAlign = "center";

    // 外圈描边及文本颜色
    ctx.strokeStyle = "white";
    ctx.fillStyle = textColor; // 应用状态颜色

    var lines = text.split("\n");
    if (curve) {
      const baseRadius = arcRadius;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        // k 是当前行的 Y 轴基线偏移量
        const k = i * spaceSize;
        // 计算当前行的实际半径，确保极小情况下不崩溃翻转
        const currentRadius = Math.max(1, convex ? baseRadius - k : baseRadius + k);

        // 拆分字符
        const chars = Array.from(line);
        const charWidths = chars.map(c => ctx.measureText(c).width);

        // 计算行总角度，用于将整句居中对齐
        const totalAngle = charWidths.reduce((sum, w) => sum + w, 0) / currentRadius;

        const useExtra = extraColorEnabled && extraColor && extraStrokeColor;
        const mid = Math.ceil(chars.length / 2);

        // 分三次遍绘制
        const passes = [
          { type: 'outer', width: 18, stroke: 'white' },
          { type: 'inner', width: 7 },
          { type: 'fill' }
        ];

        passes.forEach(pass => {
          let currentAngle = -totalAngle / 2;

          for (let j = 0; j < chars.length; j++) {
            const char = chars[j];
            const w = charWidths[j];
            const charAngle = w / currentRadius;
            const alpha = currentAngle + charAngle / 2; // 当前字符中心所在的偏转角

            const isExtra = useExtra && chars.length > 1 && j >= mid;

            ctx.save();

            // 根据凸凹状态计算字符在此曲线上的相对坐标
            const x = currentRadius * Math.sin(alpha);
            const y = convex
              ? currentRadius - currentRadius * Math.cos(alpha)
              : -currentRadius + currentRadius * Math.cos(alpha);

            // 位移到对应位置
            ctx.translate(x, y + k);
            // 依据凸凹性和当前角度让字符保持法线朝向
            ctx.rotate(convex ? alpha : -alpha);

            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";

            if (pass.type === 'outer') {
              ctx.lineJoin = "round";
              ctx.lineCap = "round";
              ctx.lineWidth = pass.width as number;
              ctx.strokeStyle = pass.stroke as string;
              ctx.strokeText(char, 0, 0);
            } else if (pass.type === 'inner') {
              ctx.lineJoin = "miter";
              ctx.lineCap = "butt";
              ctx.lineWidth = pass.width as number;
              ctx.strokeStyle = isExtra ? extraStrokeColor : strokeColor;
              ctx.strokeText(char, 0, 0);
            } else {
              ctx.fillStyle = isExtra ? extraColor : textColor;
              ctx.fillText(char, 0, 0);
            }

            ctx.restore();
            currentAngle += charAngle; // 角度推进
          }
        });
      }
    } else {
      // 逐行绘制
      for (var i = 0, k = 0; i < lines.length; i++) {
        const line = lines[i];
        // 判断是否启用分色绘制且颜色值有效
        const useExtra = extraColorEnabled && extraColor && extraStrokeColor;

        if (useExtra && line.length > 1) { // 启用分色绘制
          // 将字符串一分为二（向上取整）
          const mid = Math.ceil(line.length / 2);
          const leftText = line.substring(0, mid);
          const rightText = line.substring(mid);

          // 获取整段文字的原始宽度
          const totalWidth = ctx.measureText(line).width;

          ctx.save();

          // 外圈描边
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.lineWidth = 18;
          ctx.strokeStyle = "white";

          ctx.textAlign = "left";
          ctx.strokeText(leftText, -totalWidth / 2, k);
          ctx.textAlign = "right";
          ctx.strokeText(rightText, totalWidth / 2, k);

          // 内圈描边
          ctx.lineJoin = "miter";
          ctx.lineCap = "butt";
          ctx.lineWidth = 7;

          ctx.textAlign = "left";
          ctx.strokeStyle = strokeColor; // 左侧内圈色
          ctx.strokeText(leftText, -totalWidth / 2, k);

          ctx.textAlign = "right";
          ctx.strokeStyle = extraStrokeColor; // 右侧内圈色
          ctx.strokeText(rightText, totalWidth / 2, k);

          // 文字填充
          ctx.textAlign = "left";
          ctx.fillStyle = textColor; // 左侧填充色
          ctx.fillText(leftText, -totalWidth / 2, k);

          ctx.textAlign = "right";
          ctx.fillStyle = extraColor; // 右侧填充色
          ctx.fillText(rightText, totalWidth / 2, k);

          ctx.restore();

          k += spaceSize;
        } else {
          // 外圈描边
          ctx.lineJoin = "round";
          ctx.lineCap = 'round';
          ctx.lineWidth = 18;
          ctx.strokeStyle = "white";
          ctx.strokeText(lines[i], 0, k);

          // 内圈描边
          ctx.lineJoin = "miter";
          ctx.lineCap = 'butt';
          ctx.lineWidth = 7;
          ctx.strokeStyle = strokeColor; // 应用状态颜色
          ctx.strokeText(lines[i], 0, k);

          // 填充
          ctx.fillStyle = textColor; // 应用状态颜色
          ctx.fillText(lines[i], 0, k);

          k += spaceSize;
        }
      }
      ctx.restore();
    }
  };

  const download = async () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    const link = document.createElement("a");
    link.download = `${typedCharacters[character].name}_${text.substring(0, 10)}_arcst.micxelo.moe.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  function b64toBlob(b64Data: string, contentType: string | null = null, sliceSize: number | null = null) {
    contentType = contentType || "image/png";
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  const copy = async () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": b64toBlob(canvas.toDataURL().split(",")[1]),
      }),
    ]);
  };

  return (
    <div className="App">
      <div className="app-wrapper">
        <div className="app-header">
          <div className="header-title">
            <h1>Arcaea 贴纸生成器</h1>
          </div>
          <div className="header-buttons">
            {/* 撤销 */}
            <IconButton
              color="secondary"
              onClick={handleUndo}
              disabled={historyData.index <= 0}
              aria-label="撤销操作"
              title="撤销"
            >
              <UndoIcon />
            </IconButton>

            {/* 恢复 */}
            <IconButton
              color="secondary"
              onClick={handleRedo}
              disabled={historyData.index >= historyData.list.length - 1}
              aria-label="恢复操作"
              title="恢复"
            >
              <RedoIcon />
            </IconButton>

            {/* 分享 */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <IconButton
                color="secondary"
                onClick={handleShare}
                aria-label="分享贴纸"
                title="分享"
              >
                <ShareIcon />
              </IconButton>
            )}

            {/* GitHub */}
            <IconButton
              color="secondary"
              component="a"
              href="https://github.com/Micxelo/arcaea-stickers"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 仓库链接"
              title="GitHub 仓库"
            >
              <GitHubIcon />
            </IconButton>

            {/* 关于 */}
            <IconButton
              color="secondary"
              onClick={handleClickOpen}
              aria-label="关于信息"
              title="关于"
            >
              <InfoIcon />
            </IconButton>
          </div>
        </div>

        <div className="container">
          <div className="canvas-area">
            <div className="vertical">
              <div style={{ position: "relative", display: "inline-block" }}>
                <div
                  className="canvas"
                  role="img"
                  aria-label={`${typedCharacters[character].name} 贴纸预览`}
                >
                  <Canvas draw={draw} />
                </div>

                {/* 角色选择器 */}
                <div style={{ position: "absolute", bottom: -45, right: -45, zIndex: 1 }}>
                  <Picker setCharacter={setCharacter} />
                </div>
              </div>

              <Slider
                value={256 - position.y}
                onChange={(_, v) =>
                  setPosition({
                    ...position,
                    y: 256 - (v as number),
                  })
                }
                valueLabelDisplay="auto"
                min={0}
                max={CANVAS_CONFIG.outputHeight}
                step={1}
                orientation="vertical"
                track={false}
                color="secondary"
                aria-label="调整文字垂直位置"
              />
            </div>

            <div className="horizontal">
              <Slider
                className="slider-horizontal"
                value={position.x}
                onChange={(_, v) => setPosition({ ...position, x: v as number })}
                valueLabelDisplay="auto"
                min={0}
                max={CANVAS_CONFIG.outputWidth}
                step={1}
                track={false}
                color="secondary"
                aria-label="调整文字水平位置"
              />
            </div>

            <div className="text">
              <TextField
                label="文字内容"
                size="small"
                color="secondary"
                value={text}
                multiline={true}
                fullWidth
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* 背景颜色开关与选择器 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>背景颜色</label>
                <Switch
                  checked={bgColorEnabled}
                  onChange={(e) => setBgColorEnabled(e.target.checked)}
                  color="secondary"
                  aria-label="背景颜色开关"
                />
              </div>
              {bgColorEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    aria-label="背景颜色选择器"
                    title="选择背景颜色"
                  />
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => setBgColor("#ffffff")}
                    aria-label="重置背景颜色"
                    title="重置背景色为白色"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
            </div>

          </div>

          <div className="settings-area">
            <div className="settings">
              <div>
                <label>
                  <span style={{ whiteSpace: 'nowrap' }}>旋转角度</span>
                </label>
                <Slider
                  value={rotate}
                  onChange={(_, v) => setRotate(v as number)}
                  valueLabelDisplay="auto"
                  min={-10}
                  max={10}
                  step={0.2}
                  track={false}
                  color="secondary"
                  aria-label="调整旋转角度"
                />
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => setRotate(typedCharacters[character].defaultText.rotate)}
                  aria-label="重置旋转角度"
                  title="重置旋转角度"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </div>
              <div>
                <label>
                  <span style={{ whiteSpace: 'nowrap' }}>字体大小</span>
                </label>
                <Slider
                  value={fontSize}
                  onChange={(_, v) => setFontSize(v as number)}
                  valueLabelDisplay="auto"
                  min={10}
                  max={100}
                  step={1}
                  track={false}
                  color="secondary"
                  aria-label="调整字体大小"
                />
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => setFontSize(typedCharacters[character].defaultText.size)}
                  aria-label="重置字体大小"
                  title="重置字体大小"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </div>
              <div>
                <label>
                  <span style={{ whiteSpace: 'nowrap' }}>行间距</span>
                </label>
                <Slider
                  value={spaceSize}
                  onChange={(_, v) => setSpaceSize(v as number)}
                  valueLabelDisplay="auto"
                  min={18}
                  max={100}
                  step={1}
                  track={false}
                  color="secondary"
                  aria-label="调整行间距"
                />
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => setSpaceSize(18)}
                  aria-label="重置行间距"
                  title="重置行间距"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label>弧形文字</label>
                  <Switch
                    checked={curve}
                    onChange={(e) => setCurve(e.target.checked)}
                    color="secondary"
                    aria-label="弧形文字开关"
                  />
                </div>
                {curve && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ whiteSpace: 'nowrap' }}>上凸</label>
                    <Switch
                      checked={convex}
                      onChange={(e) => setConvex(e.target.checked)}
                      color="secondary"
                      aria-label="凹凸方向开关"
                    />
                  </div>
                )}
              </div>

              {/* 弧形半径 */}
              {curve && (
                <div>
                  <label>
                    <span style={{ whiteSpace: 'nowrap' }}>半径</span>
                  </label>
                  <Slider
                    value={arcRadius}
                    onChange={(_, v) => setArcRadius(v as number)}
                    valueLabelDisplay="auto"
                    min={50}
                    max={1000}
                    step={5}
                    track={false}
                    color="secondary"
                    aria-label="调整弧形半径"
                  />
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => {
                      const defR = typedCharacters[character].defaultText.arcRadius;
                      setArcRadius((defR !== undefined && defR > 0) ? defR : 200);
                    }}
                    aria-label="重置弧半径"
                    title="重置弧半径"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </div>
              )}

              {/* 颜色选取器 */}
              <div style={{ justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}>文字颜色</label>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    aria-label="文字颜色选择器"
                    title="选择文字颜色"
                  />
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => setTextColor(typedCharacters[character].color)}
                    aria-label="重置文字颜色"
                    title="重置为角色默认颜色"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}>描边颜色</label>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    aria-label="描边颜色选择器"
                    title="选择描边颜色"
                  />
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => setStrokeColor(typedCharacters[character].strokeColor || STROKE_CONFIG.defaultColor)}
                    aria-label="重置描边颜色"
                    title="重置为角色默认描边颜色"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>

              {/* 分色绘制开关 */}
              <div style={{ marginTop: '0.5rem' }}>
                <label>分色绘制</label>
                <Switch
                  checked={extraColorEnabled}
                  onChange={(e) => setExtraColorEnabled(e.target.checked)}
                  color="secondary"
                  aria-label="分色绘制开关"
                />
              </div>

              {/* 条件渲染的额外颜色选择器 */}
              {extraColorEnabled && (
                <div style={{ justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}>附加颜色</label>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={extraColor}
                      onChange={(e) => setExtraColor(e.target.value)}
                      aria-label="附加颜色选择器"
                      title="选择附加文字颜色"
                    />
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => {
                        const curr = typedCharacters[character];
                        if (curr.extraColor && curr.extraStrokeColor) {
                          setExtraColor(curr.extraColor);
                        } else {
                          setExtraColor(textColor);
                        }
                      }}
                      aria-label="重置附加颜色"
                      title="重置为默认值"
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}>附加描边</label>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={extraStrokeColor}
                      onChange={(e) => setExtraStrokeColor(e.target.value)}
                      aria-label="附加描边颜色选择器"
                      title="选择附加描边颜色"
                    />
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => {
                        const curr = typedCharacters[character];
                        if (curr.extraColor && curr.extraStrokeColor) {
                          setExtraStrokeColor(curr.extraStrokeColor);
                        } else {
                          setExtraStrokeColor(strokeColor);
                        }
                      }}
                      aria-label="重置附加描边颜色"
                      title="重置为默认值"
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              )}
            </div>

            <div className="buttons">
              <Button color="secondary" variant="contained" onClick={copy} aria-label="复制贴纸到剪贴板">
                复制
              </Button>
              <Button color="secondary" variant="contained" onClick={download} aria-label="下载贴纸">
                下载
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Info open={infoOpen} handleClose={handleClose} />
    </div>
  );
}

export default App;