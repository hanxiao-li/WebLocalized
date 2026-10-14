# Homepage, cases and admin

## Direction contract

THESIS: Reference-led cinematic game-localization agency paired with a practical content workspace. No invented customer proof.

OWN-WORLD: Ink atmosphere, luminous stone gate imagery, bold multilingual typography, cream pills and full blue blocks from the user's Wix wh-1204 / PROZI marketing reference; quiet Radix admin.

STORY: Understand localization services, examine explicitly illustrative cases, read insights, and submit an inquiry. Editors create Chinese drafts, translate into chosen locales, review and publish separately.

FIRST VIEWPORT: Centered, oversized two-line statement over a full-width game-world image. Business identity and description appear below the title, followed by the inquiry action. Desktop background remains fixed within the clipped hero as text scrolls; mobile and reduced-motion layouts use an absolute background. Do not restore the superseded left-aligned composition or move business copy above the title.

FORM: User-pinned Wix wh-1204 visual direction; direct implementation explicitly authorized. No approved generated page comp. The user reference remains authoritative. Image generation was used for the background asset only.

FINISH: Review implementation, document the resulting system, and preserve raster provenance. Windows detector launch failed; this is a tooling limitation, not a completed detector verdict.

## Implemented surface behavior

- About section is blue; services transition blue to paper, with the heading left and an open 2×2 service grid right on desktop. Mobile stacks heading and grid.
- Homepage cases use a 3D Coverflow with an active central cover, tilted neighboring covers, and an optional video inset at the lower-right of the active cover on desktop and mobile. Buttons, arrow keys and horizontal swipes select cases. Only the selected visible video attempts audible autoplay; native controls allow playback when browser autoplay policy blocks it.
- Case details use the optional video as a fullscreen hero, retaining playback while the visitor scrolls; otherwise the cover image fills the hero. Story, optional facts and genuine metrics, then editable text/image/split/video sections follow. Editors can reorder sections.
- User supplied public/assets/videoplay.mp4; it is configured on the first demonstration case. This asset does not make the illustrative project a verified customer case. Videos use explicit playback controls and do not autoplay audio.
- User requested text appearances throughout scrolling. Current useScrollReveal.js progressively animates main headings, paragraphs, facts and metric blocks once; the hero has its own entrance, and forms/navigation/footer are excluded. Reduced-motion and print reveal content immediately. Without the observer enhancement, existing rendered text remains visible.
- Case split and whole-width image CSS uses height:auto, preserving responsive proportions instead of retaining HTML pixel heights.

## Authority and evidence

DESIGN.md is the durable visual system; .impeccable/design.json records extensions and rendered primitive examples. Source evidence: src/style.css, src/cases.css, src/Public.jsx, src/Cases.jsx, src/useScrollReveal.js and src/admin/CaseFields.jsx. Demo company identity and projects remain editable. No client metrics, testimonials or commercial results may be invented.

验证补充：用户视频已实际播放（640×360，150.16 秒）；详情图文图片桌面为 579.7×579.7，手机为 336.2×336.2。最终截图为 detail-split-final.jpg 与 detail-split-mobile-final.jpg。滚动触发使用 threshold:0、rootMargin 底部 -22%，避免长段落因面积占比无法入场。


2026-10-14：导航固定置顶；透明公司 Logo 和 favicon 共用已发布中文网站内容的 logo 字段。首页标题 1.8s，正文入场 1.6s。用户提供的原始 Logo 位于 public/assets/icons/logo，使用无底版本复制为 public/assets/company-logo.png。

本轮完成：案例名称位于分页圆点上方；导航 90% 透明；咨询后台记录、待处理角标与可配置 SMTP 邮件通知。真实发信需配置邮箱服务；Pages 演示不发邮件。
