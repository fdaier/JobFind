# Draft PRD：日期时间输入一致性修复

> 状态：待实施确认  
> 日期：2026-09-15

## 问题

“测评截止时间”当前使用浏览器原生 `datetime-local` 控件，因此在不同浏览器中显示 `yyyy/mm/dd` 一类的默认占位格式，与 JobFind 已确认的“年—月—日”分栏日期输入不一致。

测评链接框同时带有示例占位文本，用户明确要求此处保持空白。

“整理并预览”页的内容高度可超过普通窗口；当前弹窗没有受视口约束的独立滚动区域，导致底部“保存到看板”按钮在非全屏窗口不可达。

## 方案

1. 抽取可复用的“日期 + 时分”输入组件：日期部分沿用网申截止时间的年、月、日独立输入框和日历选择器；时分使用独立的时间选择控件。
2. 在导入 JD 的填写页、导入预览页和岗位详情的“关键时间”编辑页统一使用该组件。网申截止时间继续是仅日期，测评截止、笔试时间、面试时间均使用日期加时分。
3. 清除所有“测评链接”输入框的 `https://...` 示例占位文本；字段名称与“选填”说明保留。
4. 将 JD 导入弹窗约束在动态视口高度内：标题固定保留在顶部，填写页与预览页各自使用独立的纵向滚动区。预览页的操作区保留在内容末端并使用轻量分隔，用户可在普通窗口滚动到“返回修改 / 保存到看板”，无需 F11。

## 视觉与交互原则

- **Visual thesis:** Preserve the existing quiet, compact form rhythm; the viewport boundary should be structural, not another visible card or panel.
- **Content plan:** Header stays as orientation, one scrollable working surface contains the form or preview, and the final action remains the natural last item after review.
- **Interaction thesis:** Mouse wheel, trackpad and keyboard scrolling act on the dialog working surface; reaching the action never requires changing browser zoom or entering full screen.

## 数据与验收

- 仅替换输入展示与编辑方式；已有 ISO 时间、链接以及其他岗位数据不迁移、不重置、不改写。
- 新旧时间均能正确回显、保存，并以本地时区的日期与时分显示。
- 组件测试覆盖日期、时分、日历选择和链接框无 placeholder；类型检查、lint、构建与浏览器回归通过。
- 在常见非全屏桌面窗口中，预览页可滚动到“保存到看板”，且弹窗标题、关闭入口、填写页和预览页均不被视口裁切。
