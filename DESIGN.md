---
name: Game Localization Agency
description: Reference-led cinematic public pages and practical content workspace.
colors:
  ink: "#121b25"
  paper: "#f0f0e8"
  blue: "#5973f3"
  focus: "#98b4ff"
typography:
  display:
    fontFamily: 'Outfit, "Noto Sans SC", "Microsoft YaHei", sans-serif'
    fontSize: "clamp(52px, 7.2vw, 100px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontSize: "clamp(32px, 4.8vw, 66px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  reading:
    fontSize: "17px"
    lineHeight: 1.9
rounded:
  pill: "50px"
  navigation: "22px"
spacing:
  section: "100px 7%"
  section-mobile: "60px 6%"
components:
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "16px 24px"
  navigation-link:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.navigation}"
    padding: "8px 16px"
---

# Design System: Game Localization Agency

## Overview

**Creative North Star: "Reference-led cinematic game localization"**

用户批准的 Wix wh-1204 / PROZI marketing 模板是视觉权威：深色游戏世界影像、大尺度字形、胶囊导航与蓝色区块共同建立气氛。当前系统延续已有方向；不把演示品牌或演示项目视为真实客户证据。没有已批准的独立页面 comp。

公开页面采用宽幅影像和充足留白，阅读页面以正文清晰为先，后台延续现有 Radix Themes 操作界面。滚动入场服务于阅读节奏，减少动态效果偏好优先于演出。

**Key Characteristics:**
- 深墨、米白和明蓝形成大面积色块节奏。
- 粗体标题、矩形媒体与圆润操作形成对照。
- 内容默认可见，动态效果渐进增强。

## Colors

### Primary
- **明蓝**：关于、咨询与服务过渡区域的主色，不限制为小面积装饰。

### Neutral
- **深墨**：深色背景、米白底上的正文和深色按钮。
- **米白**：阅读底色、深色背景文字及浅色操作。
- **焦点浅蓝**：键盘焦点轮廓；表单在浅底上使用更深轮廓。

**The Reference Color Rule.** 保留参考模板批准的蓝色到米白渐变，不将其替换为无依据的通用卡片底色。

## Typography

Display 与正文继承前述 Outfit 和 CJK fallback 栈；不依赖拉丁字体覆盖中日文字。首页标题使用 display；一般分区标题使用 headline，服务、案例和详情有已实现的局部尺寸。正文常用 (14–17px)，行高 (1.7–1.9)；阅读正文使用 reading。

首页标题保留内容中的换行，居中呈现，业务说明放在标题下方。移动端首页标题使用 (clamp(40px, 9.4vw, 62px))，行高 (1.2)。长标题允许换行，不截断真实内容。

## Layout

公开页面以全幅区块与双列内容为基础，一般水平留白为 (6–7%)。桌面服务区左标题、右侧两列服务项；手机上改为上下两段，服务项仍保持两列。合作流程采用明蓝底，文章采用米白底，形成明确分区。案例采用 3D Coverflow，中央封面标题位于左下，邻近案例向两侧倾斜；当前案例视频嵌入封面右下角，桌面与手机均与封面构成一个整体。具体页面组成记录在 docs/surface-brief.md。

主要响应点为 (1000px)、(767px)，宽屏 (1700px) 起约束常规分区阅读宽度。手机的故事正文、图文分区改为单列；项目信息和成果数据保持两列。详情图片通过显式比例、object-fit 和 height:auto 控制，避免 HTML 固定高度把手机图片拉成长条。

## Elevation & Depth

公开页面主要通过影像遮罩、深浅色块和细分隔线组织层次，没有通用投影卡片系统。桌面首页背景使用 fixed 定位并受首屏裁剪；手机及减少动态效果模式使用 absolute 背景。后台保持既有 Radix 层级，不复制公开站的电影感背景。

## Shapes

操作与导航为胶囊，图片和视频保持矩形。公开表单为透明底、直角和底边线。后台保留原有轻灰底、面板和输入框规则，不把后台样式推广到公开站。

## Components

### Buttons and navigation
浅色与深色胶囊遵循前述 tokens；hover 上移 (3px)，active 缩放 (.98)，过渡 (.2s)。键盘焦点为 (3px) 轮廓与 (4px) 间距。导航固定在窗口顶部，使用半透明深墨底与背景模糊，保留底图氛围。导航为横向胶囊链接，手机由带展开状态的菜单按钮切换纵向列表。品牌图标为用户提供的透明蓝色 Logo，无圆框或底色；后台中文网站内容发布后更新全语言图标与 favicon。

### Inputs
咨询表单使用可见标签、底边线、原生必填与邮箱校验；请求状态通过 status 区域反馈。焦点必须在蓝底上可辨认。

### Media and case sections
首页案例和案例详情共享可选视频，保留原生 controls、playsInline 和 preload="none"。首页当前视频可见时尝试带声音自动播放，切换或离开视野暂停。详情视频替代首屏图片，滚出视野继续播放，卸载时暂停；无视频则显示封面。减少动态效果不自动播放。详情可组合文字、全幅图、图文和视频分区，并支持后台排序。成果数据仅在有真实可公开数据时填写和展示。

### Motion
首页逐行标题使用 (1.8s) 入场；其余正文标题、段落、项目信息及数据块由一次性 IntersectionObserver 入场，持续 (1.6s)、垂直位移 (30px)，同批延迟最大 (300ms)。触发线在视窗约 78% 高度。首页、表单、导航、页脚和轮播内部文字不由该观察器统一处理；不得把当前覆盖范围写成“所有文字”均已动画。

**The Readable First Rule.** 未启用观察器时不隐藏内容；减少动态效果及打印模式禁用入场隐藏与位移。

## Do's and Don'ts

### Do:
- **Do** 延续用户批准的 Wix 参考与既有深墨、米白、明蓝视觉方向。
- **Do** 保留清晰的键盘焦点、视频控制和减少动态效果支持。
- **Do** 将演示名称、项目和素材作为可编辑示例处理。

### Don't:
- **Don't** 虚构客户、成果数据或推荐语。
- **Don't** 把手机图片固定成桌面 HTML 高度。
- **Don't** 为装饰效果牺牲正文可读性或媒体播放控制。

2026-10-14 调整：固定导航底色为 10% 不透明度（90% 透明），保留轻微背景模糊和文字阴影。案例轮播名称置于分页圆点上方。后台系统设置新增独立咨询邮件配置表单，咨询菜单显示待处理数量。
