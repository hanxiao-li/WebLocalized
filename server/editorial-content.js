// Editorial content for the three existing project scenarios.
export const caseCopy = [
 {slug:'demo-world-1',image:'/assets/cases/mist-expedition.webp',title:'雾境远征',category:'奇幻 RPG · 剧情本地化',heading:'让每个角色，都有可辨认的声音。',intro:'围绕奇幻角色扮演游戏，探索世界观术语、分支对白与任务文本如何在另一种语言中保持连贯。',scope:'剧情对白 / 世界观术语 / 任务与道具文本',challenge:'架空地名、阵营称谓与人物关系共同构成叙事。逐句翻译容易让同一角色在不同章节中语气失衡，也可能使任务线索与道具描述彼此脱节。',approach:'先建立角色语言档案，记录身份、关系、语气和禁用表达；再按场景而非表格顺序梳理对白。重要地名与道具名称统一收录术语表，并记录命名依据。',delivery:'交付按原始文本 ID 对齐的译文、角色风格指南、双语术语表和待确认问题清单。分支对白需要结合触发条件复核，任务文本则检查目标、动作与奖励之间的对应。',detail:'例如，一位守旧骑士与年轻斥候可以表达同样的警告，却不应使用相同的句式。审校时同时查看相邻对白与角色资料，判断译文是否符合人物关系，而非只检查单句是否通顺。'},
 {slug:'demo-world-2',image:'/assets/cases/stellar-echoes.webp',title:'星海回声',category:'科幻冒险 · 界面与语言测试',heading:'复杂的系统，也能一读就懂。',intro:'以科幻探索游戏为场景，协调技术术语、操作提示与紧凑界面，让玩家在关键时刻理解下一步行动。',scope:'系统与 UI 翻译 / 术语管理 / LQA',challenge:'装备属性、飞船系统和导航提示彼此关联。同一个缩写如果在菜单与教学中采用不同译法，会增加学习成本；译文长度和变量组合也可能导致界面溢出或语义不完整。',approach:'将术语按系统、装备和操作分类，区分显示名称与内部标识。为短按钮与完整说明分别制定表达规则，保留变量、富文本标签和换行约束，并向开发团队确认可调整的界面空间。',delivery:'交付译文与术语表；在约定测试范围内，按界面位置记录问题、截图、复现路径和修改建议。修订后复查实际显示，同时检查教学提示与系统菜单是否一致。',detail:'占位符不是普通文字。对包含数量、单位或动态名称的句子，需要验证变量替换后的真实结果。测试用例应覆盖长名称、不同数量与狭窄窗口，避免只用最短示例验证布局。'},
 {slug:'demo-world-3',image:'/assets/cases/wumeng-mountains.webp',title:'乌蒙山',category:'地域叙事 · 文化与创意翻译',heading:'把地方的温度，留在世界的语言里。',intro:'以山地生活与地域叙事为背景，讨论地方称谓、文化意象与人物对白如何兼顾辨识度和阅读体验。',scope:'叙事翻译 / 文化表达 / 发行文案',challenge:'地方称谓、生活习俗与含蓄的对白往往依赖共同文化背景。逐字解释会拖慢叙事，全部替换为目标语言习惯又可能抹去作品的地域气质。',approach:'先区分必须保留的专名、需要解释的概念和可自然转述的表达。结合作者资料确认含义，为重复出现的称谓建立统一规则；必要的解释优先放入自然的叙事语境。',delivery:'交付对白与叙事译文、专名对照表、文化表达说明，以及适用于商店页面的作品介绍。存在多种解读的表达保留问题记录，由创作团队确认后再统一应用。',detail:'文化转译需要解释“为什么这样说”。涉及地名、民俗或人物身份时，先确认作品中的具体设定，避免把现实文化印象直接套入虚构叙事。发行文案则聚焦玩家能够感受到的环境、关系与探索体验。'}
];
export function casePayload(c,locale){
 const zh=locale==='zh-CN',ja=locale==='ja';
 if(zh)return {image:c.image,title:c.title,category:c.category,excerpt:c.intro,storyTitle:c.heading,facts:[{label:'案例性质',value:'服务场景示例 · 非客户实绩'},{label:'服务范围',value:c.scope},{label:'语言方案',value:'按目标市场与项目资料确认'},{label:'交付安排',value:'按文本批次与版本节点约定'}],story:[{title:'项目挑战',text:c.challenge},{title:'处理思路',text:c.approach},{title:'交付与验证',text:c.delivery},{title:'合作边界',text:'本案例用于展示 word2world 的服务方法，不代表已完成的客户委托。具体语言、工作量、周期及验收标准在项目评估后确认。'}],sections:[{type:'text',title:'一个值得深入处理的细节',text:c.detail,image:'',video:''},{type:'text',title:'为下一次更新留下依据',text:'术语、风格决策与确认记录应随版本维护。新增文本先检查已有表达，再处理新增概念；涉及剧情或功能调整时同步更新相关条目，减少前后版本之间的语言断层。',image:'',video:''}],body:c.intro,metrics:[]};
 return {image:c.image,storyTitle:ja?'作品の文脈から、言葉を考える。':'Language decisions grounded in the game.',excerpt:ja?'翻訳・レビュー・検証の進め方を紹介する架空のサービス事例です。実際の顧客実績ではありません。':'A fictional service scenario exploring translation, review and validation. Not a completed client engagement.',facts:[{label:ja?'事例の性質':'Case type',value:ja?'サービスの想定事例':'Illustrative service scenario'},{label:ja?'対応範囲':'Scope',value:ja?'翻訳・用語管理・レビュー':'Translation, terminology and review'}],story:[{title:ja?'準備':'Preparation',text:ja?'キャラクター設定、画面資料、対象読者を確認し、用語と文体の方針を共有します。':'Review character notes, screenshots and audience expectations. Agree on terminology and voice before translating.'},{title:ja?'制作と検証':'Production and validation',text:ja?'文脈に沿って翻訳し、不明点を記録します。テキスト ID、変数、表示制限を確認し、合意した範囲でレビューを行います。':'Translate in context and track open questions. Review text IDs, variables and display constraints against the agreed scope.'},{title:ja?'納品':'Delivery',text:ja?'合意した形式の訳文、用語集、確認事項を納品します。言語、日程、検証範囲は案件ごとに確認します。':'Deliver translated files, a glossary and a decision log. Languages, schedule and validation coverage are agreed for each project.'}],sections:[],metrics:[]};
}
export const articleBody = `## 翻译开始前，先让团队看见同一款游戏

一份只有原文和译文两列的表格，往往不足以支撑好的游戏翻译。“离开”可能是退出菜单、离开队伍，也可能是一句带着情绪的对白。字面相同，操作后果和人物语气却不同。本地化准备的第一步，是把这些差异交代清楚。

## 1. 给文本一个稳定的身份

为每条文本保留唯一 ID，并标注用途、所属界面或剧情章节。版本更新时用 ID 对齐变化，避免依赖行号。对于重复短句，也要确认是否真的共享同一使用场景；相同原文未必适合复用同一译文。

## 2. 让上下文跟着文本走

对白需要说话者、听者、人物关系和情绪；任务需要触发条件、目标和完成状态；界面需要截图、按钮用途与长度限制。无需为每句话撰写长篇说明，优先补充可能改变理解的信息。尚未确定的设定应明确标注，避免译者把猜测写成定论。

## 3. 先统一反复出现的词

角色、地名、技能、道具与系统名称应集中维护。术语表除了译名，还应记录定义、使用场景和确认状态。风格指南则处理称呼、语气、标点与数字格式。两者的目的不是限制表达，而是减少重复讨论，让不同批次的内容保持一致。

## 4. 把技术限制写进交付要求

提交文件前说明占位符、富文本标签、换行规则和不可翻译字段。长度要求应区分字符限制与实际显示空间。动态文本需要结合真实变量检查：单独看起来通顺的句子，插入数量或道具名后仍可能出错。

## 5. 给疑问一个明确的处理路径

指定能够确认剧情与产品问题的联系人，集中记录疑问、建议与最终决定。影响大批文本的术语和设定优先确认；尚未解决的问题在交付记录中保留。新版本沿用这些决定，能减少重复沟通和前后不一致。

## 6. 将审校与游戏内验证分开安排

对照原文审校主要检查含义、遗漏、术语及表达。游戏内语言测试还需要检查显示、场景、触发顺序和实际操作。两者互相补充，不能用一份表格的检查结果替代真实界面验证。测试范围、问题格式与回归方式应提前约定。

## 发起项目咨询时，可以准备什么？

- 源语言、目标语言与计划进入的市场
- 文本类型、预计字数及可供评估的样例
- 文件格式、截图、角色与世界观资料
- 期望交付日期、上线节点与更新频率
- 是否需要审校、语言测试或发行文案支持

资料尚不完整，也可以先与 word2world 讨论范围。涉及未公开内容时，先确认保密与资料共享方式，再提供项目文件。把需求说明白，是一次顺畅合作的开始。`;
