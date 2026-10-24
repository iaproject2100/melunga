#!/usr/bin/env python3
"""Candidate semantic types for the unchanged Chinese catalogue.

The source category is deliberately not a classifier. Chinese utterances can
be short and subjectless, while a long technical noun phrase is still lexical.
Ambiguous source senses are reserved for cross-review rather than forced into
the practice themes. No phrase is split and no source field is rewritten.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "melunga_deploy/app.html"
JSON_PATH = ROOT / "docs/niveaux-progressifs/types-contenu/fr-zh.json"
MD_PATH = ROOT / "docs/niveaux-progressifs/types-contenu/fr-zh.md"


def normal_fr(value):
    value = value.lower().replace("’", "'").replace("œ", "oe")
    return " ".join("".join(c for c in unicodedata.normalize("NFD", value)
                               if unicodedata.category(c) != "Mn").split())


def bare_zh(value):
    return re.sub(r"[\s。！？?!，,；;：:、—\-]+", "", value)


# Social turns were read as turns, not inferred from their source category.
SOCIAL_TURNS = set("""
你好 您好 谢谢 谢谢你 不客气 对不起 没关系 请 再见 早上好 晚安 欢迎
好久不见 是 不是 对 不对 好 好的 不 不要 不可以 当然 太好了 没问题 救命
买单 结账 太贵了 太辣了 好吃 真的 真的吗 太棒了 下次见 干杯 随便 我请客
辛苦了 算了 没辙 走着瞧 拜托了 我也是 是吗 请坐 请进 慢走 不用了 好吗 行
不行 当然可以 还行 快点 慢点 再来一个 打包 往前走 往左 往右 到了 停这里
小心 没错 加油 可能吧 好啊 没时间 快到了 非常感谢 太好笑了 别怕 明白
别管了 好的好的 好了 不用 拜拜 恭喜 生日快乐 新年快乐 错 幸会 久仰 客气了
晚点见 回头见 明天见 下午好 晚上好 没事 够了 懂了 好主意 得了吧 试试看
应该吧 习惯了 没想到 无所谓 没道理 太值了 服了 别客气 谢谢理解 多谢
劳驾 不用谢 麻烦您 麻烦你 多有打扰 有劳您了 敬请指正 敬请谅解 期待您的回信
恕我直言 特此说明 收到 已收到 真香 老样子 你呢 怎么办 怎么了 说不定
差不多 来不及 没办法 来得及 我会 我不会 我保证 我不想 我看看 我想想
看情况 知道了 看你的 就这样 不知道 都可以 慢慢来 难怪 听你的 再想想
够意思 麻烦了 过瘾 说不清 看着办 不好说 看不出 想开点 恐怕不行
早上见 晚上见 下回见 不至于吧 可不是嘛 一言为定 一路平安 一路顺风
不敢当 请便 请慢用 回见 保重 慢用 不必客气 谢天谢地 恭喜发财
""".split())

# Some glosses present a lexical lemma or grammatical link, although their
# French translation contains a finite verb. This prevents false sentence hits.
LEXICAL_SENSES = set("""
有助于 独立于 考虑到 归功于 不外乎 看起来 听起来 最好 难道 剩下 理应 凡是
越来越 感兴趣 找不到 赶不上 受不了 忍不住 赶得上 着急 未必 大不了 何必
难免 不见得 不愧是 不管 不论 尽管 除非 如果 要是 只要 只有 既然 于是 因此
所以 因为 但是 然而 而且 并且 不过 此外 至于 关于 根据 按照 由于 尽量
也许 或许 可能 一定 反正 顺便 差点 到底 居然 说到底 没准 凑合 同时 渐渐
偶尔 从来不 总是 仍然 早晚 按时 准时 一般来说 通常 往往 临时 立刻 随时
据说 据了解 据统计 据报道 据此 就此 为此 如下 附上 详见 经核实 经确认
简言之 一言以蔽之 总而言之 总的来说 换句话说 也就是说 为了 以免 以便
以至于 鉴于 基于 越发 反而 何况 万一 即便 即使 尽管如此 从而 与此同时
""".split())

# These are syntactic supports, not standalone lexical practice or statements.
BOUND_PARTICLES = {"吗", "呢", "吧", "的", "地", "得", "了", "着", "过", "把", "被"}
INCOMPLETE_TURNS = {"我想要", "我建议", "我尽快", "我也想", "恐怕", "恳请", "承蒙",
                    "说白了就是", "关键是", "问题在于", "重点是", "更为关键的是", "必须承认",
                    "值得注意的是", "需要指出的是", "今天我想谈谈", "值得一提的是",
                    "这充分说明", "不可否认的是", "最后我想说", "重点在于", "方便的话", "如蒙惠允", "这么说吧"}

CURATED_UTTERANCES = set("""
我们开始吧 下周见 那就太好了 何乐而不为 那再好不过 我们聊聊天吧 我们一起玩吧
抓住这次机会 明人不说暗话 我们明天见面吧 拉一下这个把手 开一下空调 把垃圾扔了
我们多交流一下 把标签贴上 我们平分吧 总算松了一口气 把外套挂起来 这是尺码表
放心交给我 一码归一码 一起把它抬起来 先厘清事实 新兴品牌正在兴起 我们分成两组
丑话说在前头 我们再深入探讨一下 不打无准备之仗 我们先弄清楚问题 好好利用时间
这是我们的样品 这句话蕴含深意 这次全靠你了 我们凑钱买吧 大家都在关注这件事
这个事件催化了变革 好了好了我们开始吧 好饭不怕晚 我们再商量一下 这份合同需要反复推敲
到了告诉我 随便吃别客气 我们各让一步 祝合作愉快 我们分析一下原因 我们商量一下吧
推荐一个本地人爱吃的 这件事不用深究 这件事牵扯到很多人 这门手艺代代传承
大家呼吁降低价格 双方都能接受 我们讨论一下细节 我们归纳总结一下今天的会议
互相帮衬着来 这个价格相当于打五折 有朋自远方来不亦乐乎 还有别忘了带伞
很高兴达成合作 微辣就好不要太辣 不仅便宜而且好用 算了吧随他去 这是我们的核心产品
这款卖得最好 这个想法孕育已久 这个设计兼具美观和实用 无论多晚给我打电话
天下无难事只怕有心人 入乡随俗客随主便 不入虎穴焉得虎子 以后多多合作
有什么问题尽管问 这个品牌渗透了整个市场 这活动是为了弘扬传统文化
总的来说这次旅行很成功 与此同时孩子们在看电视 少壮不努力老大徒伤悲
风水轮流转人人都有出头之日 这家伙嘴上从来不饶人 怪不得他今天心情这么好
每个人诠释不同 这个批次有色差 欢迎下次再来谈 这个问题涉及很多方面
很高兴和您做生意 收到货款后请安排生产 希望我们合作长长久久 期待与您长期合作
由于天气原因航班延误了 追根溯源问题出在计划上 与其在这儿等不如先去吃饭
合同细节我们再确认一下 我们归纳一下要点 我们来剖析一下原因
这个产品在欧洲很受欢迎 这个数字我们再商量一下 如有疑问随时联系
这是我的名片加个微信吧 加个微信方便随时沟通 有事请联系我
有任何问题随时联系我 如有疑问请联系我 这批货比预计晚了一周
这个职位赋予他更多责任 总的来看情况在好转 关键时刻别掉链子 功到自然成
我们合作吧 我们比较一下 我们长期合作 我们记录一下 我们各退一步 期待您的回复
我们评估一下 需要上级批准 我们各让一半 按这个价成交 先签个意向 我们折中一下
先小批量试试 有问题随时找我 我们同步一下 我们分头行动 我们对一下细节
一环扣一环 接下来我们来看 以上就是我的看法 如有不妥请指正 这个问题值得商榷
我们不妨换个思路 雨过天晴一切都会好的 好歹咱们也算试过了 原则上没问题
按这个进度没问题 合作愉快干杯 质量问题我们全额退款 出门之前记得关灯
最后一切都好了 总之谢谢你的帮助 既然如此那就这样吧
""".split())

# Counter-review of vocabulary candidates outside cat:vocab: the source often
# nominalizes a full Chinese utterance in its French gloss. These decisions
# follow the Chinese predicate, imperative or conventional reply itself.
CURATED_UTTERANCES |= set("""
等一下 没什么 怎么讲呢 怎么说呢 差不多吧 多亏了你 说真的呢 帮帮我 换一个 快起来 你先走 放心吧 你来选吧 销量在增长 太可惜了 你猜猜看 待会见
竞争在加剧 先别拆开 时不我待 积少成多 百闻不如一见 礼尚往来 以柔克刚
经验是慢慢沉淀的 和实生物同则不继 经验是慢慢积累的 艰难困苦玉汝于成
坚持就是胜利 数据驱动我们的决策 有教无类 订单支撑着我们的生产 海纳百川有容乃大
大巧若拙大辩若讷 锲而不舍金石可镂 天生我材必有用 千里之堤毁于蚁穴
心急吃不了热豆腐 远水解不了近渴 逝者如斯夫不舍昼夜 小不忍则乱大谋
大巧若拙大智若愚 岁月不居时节如流 船到桥头自然直 合同一式两份
学而不思则罔思而不学则殆 宁静以致远淡泊以明志 路遥知马力日久见人心
听到这个消息我特别激动 双方签字盖章 滴水穿石非一日之功
问渠那得清如许为有源头活水来 看到他平安我总算放心了 过了这个村就没这个店了
古之学者为己今之学者为人 躬自厚而薄责于人则远怨矣
下次请提前备货 下次来中国一定联系我 一旦决定了就不要后悔 不知道结果我心里像猫抓一样
批发价和零售价不一样 年轻人应该出去闯一闯 双方还在磋商细节
加我微信 订单增加了 计划改变了 天气影响了发货 公司制定了新计划
价格体现了质量 问题在于价格 延误导致了损失 数据显示销量在增长 计划已经落实了
不吝赐教 太大了 太小了 太多了 太重了 太轻了 质量很好 太累了 慢慢说
你先请 下次吧 当然了 太咸了 太甜了 再来一杯 老师表扬了他 质量最重要
会议推迟了 价格下降了 温度在上升 换个话题 计划开始实施了
数量超过了预算 先看样品 放轻松 稍等 新产品带动了销量 合同约束了双方
公司调动了更多资源 数据显示出增长趋势 急也没用 系统崩溃了 车撞上了
我的电脑又死机了 视频一直在卡 改天吧 公司注重培育人才 经理号召大家加油
数据呈现上升趋势 言归正传 没门儿 随时都行 会议决定 后会有期
期待合作 敬候佳音 不胜感激 恭候大驾 承蒙厚爱 盼复 敬请知悉
感激不尽 静候佳音 恭候回复 恭候光临 合作愉快 荣幸之至 蓬荜生辉
不胜期待 谨表谢忱 不胜惶恐
千里之行始于足下 大智若愚 大巧若拙 厚德载物 海纳百川 淡泊明志 宁静致远
水滴石穿 祸从口出 大器晚成 知彼知己百战不殆 上德不德 道法自然 大器天成
行远自迩 玉汝于成 涓滴成河 聚沙成塔集腋成裘
君子和而不同小人同而不和 凡事预则立不预则废 天行健君子以自强不息
君子成人之美 君子喻于义小人喻于利 君子求诸己小人求诸人 桃李不言下自成蹊
宝剑锋从磨砺出梅花香自苦寒来 大江东去浪淘尽千古风流人物 穷则思变 变则通通则久
君子欲讷于言而敏于行 君子周而不比 君子怀德小人怀土 君子喻于义
君子学以致其道 礼之用和为贵 君子无所争 君子食无求饱居无求安
内省不疚夫何忧何惧 君子固穷小人穷斯滥矣 君子上达小人下达
巧言乱德小不忍则乱大谋 这个面料洗了会缩水 今天真累 这种机会可遇不可求
早起的鸟儿有虫吃 竞争对手的报价更低 汇率最近波动很大 产品有防伪标签
市场在不断演变 结果印证了我们的猜测 多提宝贵意见 人生自古谁无死留取丹心照汗青 苟利国家生死以岂因祸福避趋之 博学之审问之慎思之明辨之笃行之 先来壶茶 买单谢谢 好好发挥你的优势 省得回头有人说我们没提醒
期待与您的合作 不吝赐教为盼
""".split())

CURATED_VOCABULARY = set("""
不可或缺的 势在必行的 更上一层楼 厚积而薄发 视情况而定 喜怒不形于色
炉火纯青登峰造极 一步一个脚印 站在你的角度 退一步来说 核心竞争力 可持续发展
在此基础上 不管怎么说 按计划推进 确保万无一失 经双方友好协商
在平等基础上 经过慎重考虑 综合各方意见 有条不紊地推进 建立长期合作关系
达成一致意见 按合同办事 达成初步意向 运筹帷幄之中 决胜千里之外
举个例子来说 换个角度来看 从数据上看 综合考虑各种因素 举足轻重的 行之有效的
恰逢其时的 水涨船高的 从本质上看 从某种程度上 在很大程度上
博采众长为己所用 雪中送炭之情 兢兢业业勤勤恳恳
纪要 银行账户 账号 密码 终究 综合来看 耐人寻味 行之有效 守口如瓶
下一个问题 我 你 他 她 我们 你们 他们 预约 约会 有 没有 据我所知 有空的时候 由此可见 理所当然 不可否认 恰到好处 不言而喻 水到渠成 好吃 差不多 难怪 说不定 过瘾 够意思 塞翁失马 任重道远 各取所需
一诺千金 和气生财 话不投机 分秒必争 得不偿失 亡羊补牢 顾客至上 行胜于言
众志成城 聚沙成塔 集腋成裘 学无止境
""".split())
SOCIAL_TURNS -= CURATED_VOCABULARY

NUM = r"[零〇一二两三四五六七八九十百千万亿兆]+"
PURE_NUMBER = re.compile(rf"(?:第{NUM}|{NUM}|{NUM}分之{NUM}|[+-]?\d+(?:[.,]\d+)?(?:[%％])?|\d+/\d+|半|一半)")
CLOCK = re.compile(rf"(?:{NUM}|\d+)(?:点|时)(?:(?:{NUM}|\d+)分?|半|一刻|三刻)?")

FR_SUBJECT = re.compile(
    r"(?:^|[ ,;:—(])(?:je|j'|tu|il|elle|on|nous|vous|ils|elles|ca|cela|ceci|c'est|ce sont)"
    r"(?:\s+|(?<=j'))(?![/)])\S", re.I)
FR_FINITE = re.compile(
    r"\b(?:est|sont|etait|etaient|sera|seront|aura|auront|avait|avaient|ont|"
    r"reste|restent|coute|coutent|fait|font|faisait|prend|prennent|veut|veulent|"
    r"doit|doivent|peut|peuvent|vaut|valent|va|vont|depend|dependent|comprend|"
    r"comprennent|manque|manquent|semble|semblent|contient|contiennent|inclut|"
    r"exige|exigent|prevoit|represente|correspond|existe|garde|gardent|"
    r"compte|comptent|donne|donnent|passe|passent|arrive|arrivent|"
    r"suffit|fallait|faudra|faut|convient|permet|permettent|revient|"
    r"recolte|vit|voit|verra|vivra|craint|repond|gagne|trouve|rend|tombe)\b")
FR_INVERSE = re.compile(r"\b[\w'-]+-(?:tu|vous|il|elle|on|je)\b")
FR_IMPERATIVE = re.compile(
    r"^(?:(?:ne|n')\s*)?(?:regarde|regardez|montre|montrez|prenez|prends|allez|allons|"
    r"venez|viens|donne|donnez|faites|fais|dites|dis|soyez|sois|ayez|aie|ecoute|"
    r"ecoutez|attends|attendez|laisse|laissez|tiens|tenez|oublie|oubliez|garde|"
    r"gardez|restons|reste|restez|continue|continuez|suivez|mets|mettez|envoyez|"
    r"envoie|signez|signe|acceptez|accepte|note|notez|veuillez|confirme|confirmez|"
    r"appelez|appelle|arrete|arretez|entrez|assieds|asseyez|repetez|repete|"
    r"excusez|excuse|redemarre|redemarrez|rappelle|rappelez|assurez|assure|"
    r"permettez|considerez|essayez|essaie|profitez|profite|imagine|imaginez|"
    r"respecte|respectez|prevoyez|prevois|previent|prevenez|prie|priez)\b")
FR_INFINITIVE = re.compile(
    r"^(?:ne pas |se |s'|de |d')?(?:etre|avoir|faire|dire|voir|aller|venir|mettre|"
    r"prendre|donner|demander|tenir|devoir|pouvoir|savoir|vouloir|falloir|"
    r"recevoir|rendre|laisser|paraitre|connaitre|entendre|comprendre|"
    r"appeler|lire|ecrire|vivre|suivre|permettre|obtenir|ouvrir|offrir|"
    r"conduire|produire|repondre|servir|retenir|conclure|defendre|"
    r"assumer|payer|envoyer|parler|fournir|confier|prevenir|remplir|"
    r"partir|sortir|revenir|reussir|finir|choisir|subir|traduire|reduire|"
    r"realiser|considerer|expliquer|traiter|reprendre|chercher|manger|boire|"
    r"remettre|enregistrer|attendre|reconnaitre|interdire|reprendre|"
    r"apprendre|signer|investir|negocier|developper|accueillir|"
    r"verifier|revoir|repondre|prendre|recevoir|livrer|fabriquer|"
    r"affiner|autoriser|recharger|surveiller|concerter|convenir|"
    r"normaliser|controler|diriger|examiner|admettre|peser|tenter)\b")
FR_NOMINAL = re.compile(r"^(?:le |la |les |l'|un |une |des |du |de la |mon |ma |mes |ton |ta |tes |son |sa |ses |notre |nos |votre |vos |leur |leurs )")



# Lexical classes describe the Chinese sense, not the French part of speech.
# These explicit inventories were read against the actual source entries.
ADJECTIVES = set("""
恰到好处 不言而喻 理所当然 不可或缺的 势在必行的 无懈可击 井井有条 过瘾 彬彬有礼 笑容可掬 无能为力
一目了然 有目共睹 有理有据 好吃 大 小 新 旧 好看 快 慢 热 冷 远 近 贵 便宜 累 忙 难 容易
一样 不一样 高兴 难过 紧张 有意思 没意思 重要 差 棒 方便 清楚 简单 复杂 安全 危险
熟悉 陌生 满意 合适 合理 正常 正式 认真 仔细 主动 积极 靠谱 激动 失望 无聊 骄傲
明显 严重 巨大 具体 普遍 独特 传统 现代 国际 全球 专业 先进 名副其实 迫在眉睫
一模一样 物美价廉 互利共赢 焦虑 沮丧 委屈 尴尬 犹豫 纠结 释然 欣慰 无奈
明确 详细 准确 稳定 灵活 高效 可靠 持续 充分 彻底 势在必行 一丝不苟 有条不紊
举足轻重 微妙 棘手 严谨 周全 得体 果断 谨慎 务实 从容 坦诚 高瞻远瞩 不可或缺
顺理成章 大同小异 入木三分 深刻 独到 精辟 缜密 娴熟 睿智 豁达 淡定 恰如其分
如出一辙 出神入化 匠心独运 虚怀若谷 鞭辟入里 发人深省 意味深长 耐人寻味
言简意赅 掷地有声 入情入理 有条有理 一样的 漂亮 好喝 干净 脏 安静 吵 高 矮 长 短
宽 窄 重 轻 厚 薄 满 空 舒服 奇怪 有名 胖 瘦 年轻 老 帅 可爱 聪明 笨 懒 自由
不辣 兴奋 轻松 孤独 幸福 惊讶 准时 主要 必要 正确 真实 公平 诚实 友好 礼貌
耐心 勇敢 小气 大方 过敏 受伤 开心 自信 害羞 热情 结实 柔软 硬 光滑 粗糙 透明
亮 暗 湿 干 甜 酸 苦 咸 独家 关键 核心 基本 额外 频繁 罕见 潜在 实际 合格 不合格
防水 防震 耐用 环保 可回收 无线 智能 肿 成熟 初步 全面 素食 微辣 潮湿 干燥 凉快 温暖
不放心 有把握 没把握 双赢 最优惠 困惑 荣幸 不胜荣幸 乐观 悲观 谦虚 自负 固执
随和 挑剔 严厉 宽容 体贴 踏实 浮躁 敬业 可持续 卓越 出色 优异 显著 突出 有限
充足 匮乏 成熟稳定 郁闷 烦 烦躁 心烦 无语 划算 亏 悬 稳 糊涂 清醒 理智 冲动
现实 天真 好用 好办 难办 顺利 省心 坚定不移 典型 兢兢业业 童叟无欺 货真价实
经济实惠 量身定制 喜出望外 如释重负 忐忑不安 心平气和 半信半疑 门庭若市
应接不暇 实至名归 名列前茅 首屈一指 独一无二 举世闻名 有口皆碑 尽善尽美
井然有序 刻不容缓 稳操胜券 瞬息万变 互惠互利 以人为本 表里如一 无可非议
模棱两可 含糊其辞 卓有成效 势不可挡 不卑不亢 落落大方 平易近人 不苟言笑
守口如瓶 小心谨慎 谨小慎微 爱莫能助 表里不一 粗心大意 滴水不漏 天衣无缝
新的 便宜的 贵的 不错 脚踏实地 处变不惊 临危不乱 万无一失 始终如一 公共 系统 周密 详尽 翔实 全方位 多元化 个性化 规范化 鞭辟近里
环环相扣 千锤百炼 好玩 方兴未艾 举足轻重的 行之有效的 与众不同 恰逢其时的
水涨船高的 深远 广泛 多样 特定 相应 典型的 显著的 持久 深层 综合性 前沿 尖端
领先 优质 高端 精准 稳健 敏锐 前瞻 尤为重要 至关重要 实质性 宠辱不惊 同心同德
独步天下 举世无双 盖世无双 没齿难忘 矢志不渝 初心不改 兢兢业业勤勤恳恳 上下同心
""".split())

ADVERBS = set("""
差不多 未必 一下子 多多少少 说不定 越来越 也许 很 一定 更 最 比较 已经 还没 正在 马上
经常 从来 一直 突然 大概 尽量 反正 顺便 差点 到底 究竟 居然 大不了 没准
不见得 难免 都 也 还 只 就 再 一起 一共 非常 稍微 几乎 完全 至少 最多 大约
渐渐 偶尔 从来不 总是 仍然 按时 提前 确实 显然 幸好 难道 毕竟 甚至 只好 干脆
不仅仅 通常 往往 临时 立刻 随时 即将 逐步 定期 相应地 尽快 大幅 故意 特意 亲自
毫无疑问 未免 姑且 终究 势必 无非 不一定 好不容易 最终 将近 足足 仅仅 挺 超 蛮
诚然 固然 必然 理应 唯有 一鼓作气 尽心尽力 从容不迫 话不多说 又 才 刚 这么
锲而不舍 按部就班
""".split())

PREPOSITIONS = set("""
比 关于 对于 根据 按照 由于 为了 依据 针对 基于 借助 鉴于 相较于
考虑到 归功于 除此以外 基于此 按计划 根据要求 按照规定 在此基础上
在平等基础上 经过慎重考虑 经双方友好协商 从数据上看 从本质上看
从根本上 从某种程度上 在很大程度上
""".split())

# A bare word or gloss can genuinely leave more than one Chinese analysis open.
# It is safer to reserve its POS than to copy the apparent French adjective.
UNCERTAIN_POS = set("""
国际 全球 专业 核心 关键 实际 现实 前沿 尖端 高端 前瞻 不可否认 由此可见 据我所知 有空的时候 可能 特别 一般 多 少 早 晚 最好 感兴趣 感动 着急 够意思 舍不得 松了口气
其中 值得一提 众所周知 显而易见 得心应手 力所能及 深思熟虑 游刃有余 淋漓尽致
潜移默化 恰逢其时 恰如其时 好多 不少 够 必须 愿意 肯 值得 上瘾 到位 到账
便宜点 少一点 早晚 最近 将来 早点 晚点 同时 有时候 一会儿
无可厚非 不可小看 尽管如此 如上所述 据说 据统计 据了解 据报道 据此 就此 为此
""".split())

LOCATIVE_NOUNS = set("""
这里 那里 这儿 那儿 上 下 里 外 前 后 左 右 旁边 对面 中间 附近
右边 左边 前面 后面 这边 那边 上面 下面 里面 外面 楼上 楼下 家里 网上
""".split())
TEMPORAL_NOUNS = set("""
现在 今天 明天 昨天 今年 早上 中午 晚上 小时 分钟 星期 月 年 刚才
上午 下午 周末 这个星期 星期一 星期二 星期三 星期四 星期五 星期六 星期天
每天 后天 前天 明年 去年 一天 每次 一整天 最初 期间 长期 短期
稍后 半天 没多久 一阵子 一段时间 从头 下回
""".split())


def classify_lexical(card):
    zh = bare_zh(str(card.get("t", "")))
    fr = normal_fr(str(card.get("frm", "")))
    if zh in {"红色", "蓝色", "白色", "黑色", "绿色", "黄色"}:
        lexical_class = "color"
        reason = "Nom de couleur isolé lu dans la cible chinoise et son sens source ; ni fleur, ni fruit, ni phrase contenant une couleur."
        reviewed = True
    elif zh in UNCERTAIN_POS:
        lexical_class = "uncertain"
        reason = "La forme ou le sens chinois permet plusieurs fonctions ; la traduction française seule ne tranche pas la classe lexicale."
        reviewed = True
    elif zh in ADJECTIVES:
        lexical_class = "adjective"
        reason = "Mot ou locution chinoise de propriété ou d’état dans le sens source ; aucune phrase prédicative complète n’est extraite."
        reviewed = True
    elif zh in ADVERBS:
        lexical_class = "adverb"
        reason = "Modificateur chinois de degré, fréquence, aspect, modalité ou manière dans le sens source ; ce n’est pas une préposition inférée du français."
        reviewed = True
    elif zh in PREPOSITIONS:
        lexical_class = "preposition"
        reason = "Relateur, coverbe dans son emploi relationnel, ou groupe prépositionnel borné attesté par l’entrée ; aucune règle universelle n’est déduite."
        reviewed = True
    elif zh in LOCATIVE_NOUNS:
        lexical_class = "other"
        reason = "Repère spatial ou localisateur chinois ; sa traduction par une préposition française ne le transforme pas en préposition chinoise."
        reviewed = True
    elif zh in TEMPORAL_NOUNS or CLOCK.fullmatch(zh):
        lexical_class = "other"
        reason = "Nom ou groupe temporel chinois ; l’emploi possible comme circonstanciel ne suffit pas à le classer comme adverbe lexical."
        reviewed = True
    elif re.fullmatch(r"[红蓝白黑绿黄紫橙灰棕粉]色", zh):
        lexical_class = "other"
        reason = "Nom de couleur en 色 dans cette entrée ; le sens français adjectival ne remplace pas l’analyse de la forme chinoise."
        reviewed = True
    elif FR_INFINITIVE.search(fr):
        lexical_class = "other"
        reason = "Verbe ou locution verbale chinoise dans le sens lexical source ; hors des trois classes grammaticales demandées."
        reviewed = False
    elif re.search(r"(?:性|力|量|率|度|心|业|品|费|款|单)$", zh) and len(zh) > 1:
        lexical_class = "other"
        reason = "Forme nominale ou technique dans le sens source ; aucun adjectif ou adverbe n’est déduit d’un élément interne."
        reviewed = False
    else:
        lexical_class = "other"
        reason = "Entrée lexicale hors des inventaires explicites d’adjectifs, prépositions et adverbes ; proposition nominale, verbale ou idiomatique à confirmer lors de la revue sémantique."
        reviewed = False
    return {"lexicalClass": lexical_class, "lexicalClassReason": reason,
            "lexicalClassReviewStatus": "reviewed" if reviewed else "rule-based-candidate"}


def result(kind, reason, reviewed=False):
    return {"contentType": kind, "reason": reason,
            "reviewStatus": "reviewed" if reviewed else "rule-based-candidate"}


def classify_semantic(card, source_index=None):
    study = str(card.get("t", ""))
    zh = bare_zh(study)
    fr = normal_fr(str(card.get("frm", "")))
    if not zh or not fr:
        return result("review", "Une forme étudiée ou un sens source manque ; ne pas déduire un type.")
    if re.search(r"…|\.\.\.|\{[^}]*\}|_{2,}", study):
        return result("incomplete", "Le texte étudié porte un emplacement ou une amorce ouverte ; aucune complétion n’est créée.")
    if zh in INCOMPLETE_TURNS:
        return result("incomplete", "Amorce de demande, de proposition ou de subordination sans contenu précisé dans la source.", True)
    if zh == "得" and ("devoir" in fr or "dei" in str(card.get("py", "")).lower()):
        return result("vocabulary", "得 est ici le modal děi (« devoir »), pas la particule de complément de degré.", True)
    if zh in BOUND_PARTICLES:
        return result("incomplete", "Particule ou marqueur grammatical lié : support à préparer dans un énoncé, pas réplique autonome.", True)
    if PURE_NUMBER.fullmatch(zh):
        return result("number", "Nombre, ordinal ou fraction autonome, sans objet, unité ni proposition.")
    if CLOCK.fullmatch(zh):
        return result("vocabulary", "Repère horaire isolé ; c’est une locution de temps, pas un nombre pur ni une phrase.")
    if zh in CURATED_UTTERANCES:
        return result("utterance", "La forme chinoise et son sens ont été lus comme énoncé, consigne ou réplique complets, sans ajout de contexte lexical.", True)
    if zh in CURATED_VOCABULARY:
        return result("vocabulary", "La source présente un mot, groupe nominal ou locution lexicale ; une traduction française développée n’en fait pas automatiquement une phrase chinoise.", True)
    if zh in SOCIAL_TURNS:
        return result("utterance", "Formule sociale, consigne brève ou réponse conventionnelle pouvant former un tour complet.", True)
    if zh in LEXICAL_SENSES:
        return result("vocabulary", "Mot ou locution de liaison/description dans le sens indiqué ; aucun énoncé complet n’est fourni.", True)
    if re.search(r"[？?]", study):
        return result("utterance", "Question entière ou question elliptique contextualisable, conservée sans découpage.")
    if re.match(r"^(?:请|别|不要|不必|麻烦|给我|帮我|替我|让我们|记得|记住)", zh):
        return result("utterance", "Demande ou consigne avec un contenu exprimé dans la forme chinoise.")
    if re.match(r"^(?:我|你|您|他|她|它|咱们|大家|每个人)", zh):
        # A possessive group alone has a possessor, not a predicate.
        if re.match(r"^(?:我|你|您|他|她|它|我们|你们|他们|她们|咱们)的", zh) and not re.search(r"[。！!，,]", study):
            if not FR_SUBJECT.search(fr) and not FR_FINITE.search(fr):
                return result("vocabulary", "Groupe nominal possessif sans prédication exprimée dans le sens source.")
        if len(zh) >= 3 and (FR_SUBJECT.search(fr) or FR_FINITE.search(fr) or re.search(r"[。！!，,]", study)):
            return result("utterance", "Énoncé avec participant et prédication ; la catégorie source n’est pas utilisée comme preuve.")
    if FR_SUBJECT.search(fr) or FR_INVERSE.search(fr) or FR_IMPERATIVE.search(fr):
        return result("utterance", "Le sens source exprime une affirmation, question, consigne ou réponse complète.")
    if re.match(r"^(?:merci|pardon|desole|bonjour|bonsoir|bonne nuit|bonne annee|bon appetit|bon voyage|salut|bienvenue|felicitations|de rien|au revoir|a bientot|a demain|a tout a l'heure|enchante|avec plaisir|pas de probleme|sans probleme)\b", fr):
        return result("utterance", "Formule sociale ou réponse autonome indiquée par le sens source.")
    if FR_FINITE.search(fr) and not FR_INFINITIVE.search(fr):
        return result("utterance", "Le sens source contient une prédication complète, même sans sujet pronominal initial.")
    if FR_INFINITIVE.search(fr):
        return result("vocabulary", "L’entrée est donnée comme verbe ou locution verbale à l’infinitif, sans acte de parole complet.")
    if FR_NOMINAL.search(fr):
        return result("vocabulary", "Nom ou groupe nominal dans le sens source, sans prédication ni formule de réponse.")
    if re.search(r"[。！!，,；;]", study):
        return result("review", "Ponctuation présente mais autonomie sémantique non établie par les autres indices ; réservé à la relecture.")
    if len(zh) <= 4:
        return result("vocabulary", "Mot ou locution courte dans le sens donné, sans indice de tour de parole autonome.")
    return result("review", "Frontière entre locution lexicale et énoncé non tranchée automatiquement ; aucune production imposée.")



# Explicit semantic routing decisions reviewed against source indices and whole meanings.
LEXICAL_FAMILY_OVERRIDES = {150: {'destination': 'vocab-loisirs',
       'reason': 'Film, musique, livre ou domaine culturel explicitement nommé ; le groupe verbal '
                 'entier reste conservé lorsqu’il s’agit de regarder ou écouter.'},
 435: {'destination': 'vocab-loisirs',
       'reason': 'Film, musique, livre ou domaine culturel explicitement nommé ; le groupe verbal '
                 'entier reste conservé lorsqu’il s’agit de regarder ou écouter.'},
 658: {'destination': 'vocab-actions',
       'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou le '
                 'déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un sens '
                 'abstrait.'},
 662: {'destination': 'vocab-actions',
       'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou le '
                 'déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un sens '
                 'abstrait.'},
 2175: {'destination': 'vocab-actions',
        'reason': 'La cible est un verbe, un modal ou un groupe verbal général ; aucun nom domestique '
                  'ni état corporel ne justifie la famille précédente.'},
 2179: {'destination': 'vocab-actions',
        'reason': 'La cible est un verbe, un modal ou un groupe verbal général ; aucun nom domestique '
                  'ni état corporel ne justifie la famille précédente.'},
 2196: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2197: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2271: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2272: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2279: {'destination': 'vocab-travail',
        'reason': 'Lieu de démarche bancaire, postale ou administrative explicitement nommé dans la '
                  'source.'},
 2282: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 2306: {'destination': 'vocab-reperes',
        'reason': 'Groupe de quantité ou unité de comptage lu dans la cible chinoise ; ce n’est ni un '
                  'nombre pur ni un objet domestique ou une douleur.'},
 2307: {'destination': 'vocab-reperes',
        'reason': 'Groupe de quantité ou unité de comptage lu dans la cible chinoise ; ce n’est ni un '
                  'nombre pur ni un objet domestique ou une douleur.'},
 2308: {'destination': 'vocab-reperes',
        'reason': 'Groupe de quantité ou unité de comptage lu dans la cible chinoise ; ce n’est ni un '
                  'nombre pur ni un objet domestique ou une douleur.'},
 2342: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2343: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2344: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2345: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2346: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2347: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2348: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2349: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2403: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 2419: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 2488: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2489: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2498: {'destination': 'vocab-loisirs',
        'reason': 'Film, musique, livre ou domaine culturel explicitement nommé ; le groupe verbal '
                  'entier reste conservé lorsqu’il s’agit de regarder ou écouter.'},
 2500: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 2505: {'destination': 'vocab-loisirs',
        'reason': 'Film, musique, livre ou domaine culturel explicitement nommé ; le groupe verbal '
                  'entier reste conservé lorsqu’il s’agit de regarder ou écouter.'},
 2507: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 2589: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2609: {'destination': 'vocab-travail',
        'reason': 'Programme d’action, solution ou conduite d’un ensemble de tâches ; le sens est '
                  'organisationnel, sans trajet ni objet domestique.'},
 2643: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2667: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2685: {'destination': 'vocab-travail',
        'reason': 'Programme d’action, solution ou conduite d’un ensemble de tâches ; le sens est '
                  'organisationnel, sans trajet ni objet domestique.'},
 2690: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2720: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 2840: {'destination': 'vocab-voyage',
        'reason': 'Action de déplacement, change de monnaie ou sortie d’hôtel effectivement exprimée '
                  'par la cible et son sens entier.'},
 2848: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2849: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2900: {'destination': 'vocab-personnes',
        'reason': '先生 et 女士 désignent des personnes et des titres de civilité, pas des objets '
                  'domestiques.'},
 2901: {'destination': 'vocab-personnes',
        'reason': '先生 et 女士 désignent des personnes et des titres de civilité, pas des objets '
                  'domestiques.'},
 2925: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2926: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 2927: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2928: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2929: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2930: {'consolidationReason': 'Consolidation fonctionnelle décidée par le propriétaire : les '
                               'localisateurs chinois préparent les relations de position et leurs '
                               'reprises dans la même rubrique. Le nom interne vocab-prepositions est '
                               'fonctionnel ; lexicalClass reste other et ne prétend pas que ces mots '
                               'chinois sont des prépositions françaises.',
        'destination': 'vocab-prepositions',
        'lexicalUsage': 'chinese-localizer',
        'previousFamily': 'vocab-reperes',
        'reason': 'Consolidation fonctionnelle décidée par le propriétaire : les localisateurs chinois '
                  'préparent les relations de position et leurs reprises dans la même rubrique. Le nom '
                  'interne vocab-prepositions est fonctionnel ; lexicalClass reste other et ne prétend '
                  'pas que ces mots chinois sont des prépositions françaises.'},
 2931: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 2962: {'destination': 'vocab-actions',
        'reason': 'La cible est un verbe, un modal ou un groupe verbal général ; aucun nom domestique '
                  'ni état corporel ne justifie la famille précédente.'},
 2993: {'destination': 'vocab-loisirs',
        'reason': 'Pratique de la photographie présentée comme groupe verbal lexical entier ; ce n’est '
                  'pas un simple objet de transport.'},
 2999: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 3023: {'destination': 'vocab-actions',
        'reason': 'Téléphone comme objet de communication général ; l’entrée ne nomme pas un meuble ou '
                  'un élément de la maison.'},
 3035: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3036: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3039: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 3042: {'destination': 'vocab-loisirs',
        'reason': 'Film, musique, livre ou domaine culturel explicitement nommé ; le groupe verbal '
                  'entier reste conservé lorsqu’il s’agit de regarder ou écouter.'},
 3046: {'destination': 'vocab-nature',
        'reason': 'Lieu végétalisé ou animal réellement nommé, sans phrase ni image animale figurée.'},
 3050: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3051: {'destination': 'vocab-travail',
        'reason': 'Lieu de démarche bancaire, postale ou administrative explicitement nommé dans la '
                  'source.'},
 3052: {'destination': 'vocab-travail',
        'reason': 'Lieu de démarche bancaire, postale ou administrative explicitement nommé dans la '
                  'source.'},
 3058: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 3059: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 3063: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 3064: {'destination': 'vocab-restaurant',
        'reason': 'Aliment, ustensile, magasin ou activité d’achat réellement désignés par la cible '
                  'chinoise ; aucun sens figuré ajouté.'},
 3076: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3089: {'destination': 'vocab-voyage',
        'reason': 'Action de déplacement, change de monnaie ou sortie d’hôtel effectivement exprimée '
                  'par la cible et son sens entier.'},
 3090: {'destination': 'vocab-actions',
        'reason': 'Action bancaire générale (retirer ou emprunter de l’argent), sans commande de '
                  'restaurant ou produit à acheter dans cette entrée.'},
 3092: {'destination': 'vocab-actions',
        'reason': 'Action bancaire générale (retirer ou emprunter de l’argent), sans commande de '
                  'restaurant ou produit à acheter dans cette entrée.'},
 3094: {'destination': 'vocab-actions',
        'reason': 'La cible est un verbe, un modal ou un groupe verbal général ; aucun nom domestique '
                  'ni état corporel ne justifie la famille précédente.'},
 3111: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3112: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3113: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3114: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3115: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3116: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3117: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3118: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3119: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3120: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3121: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3122: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3123: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3124: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3129: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3132: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3135: {'destination': 'vocab-nature',
        'reason': 'Lieu végétalisé ou animal réellement nommé, sans phrase ni image animale figurée.'},
 3136: {'destination': 'vocab-nature',
        'reason': 'Lieu végétalisé ou animal réellement nommé, sans phrase ni image animale figurée.'},
 3137: {'destination': 'vocab-nature',
        'reason': 'Lieu végétalisé ou animal réellement nommé, sans phrase ni image animale figurée.'},
 3138: {'destination': 'vocab-nature',
        'reason': 'Lieu végétalisé ou animal réellement nommé, sans phrase ni image animale figurée.'},
 3165: {'destination': 'vocab-actions',
        'reason': 'La cible est un verbe, un modal ou un groupe verbal général ; aucun nom domestique '
                  'ni état corporel ne justifie la famille précédente.'},
 3166: {'destination': 'vocab-actions',
        'reason': 'La cible est un verbe, un modal ou un groupe verbal général ; aucun nom domestique '
                  'ni état corporel ne justifie la famille précédente.'},
 3265: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3313: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3318: {'destination': 'vocab-voyage',
        'reason': 'Action de déplacement, change de monnaie ou sortie d’hôtel effectivement exprimée '
                  'par la cible et son sens entier.'},
 3339: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3341: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3342: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3346: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3353: {'destination': 'vocab-reperes',
        'reason': 'Groupe de quantité ou unité de comptage lu dans la cible chinoise ; ce n’est ni un '
                  'nombre pur ni un objet domestique ou une douleur.'},
 3363: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3555: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3564: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3565: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3568: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3569: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3570: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3571: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3572: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3573: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3574: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3575: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3576: {'destination': 'vocab-personnes',
        'reason': 'Partie du corps, médicament, symptôme ou soin concret : la température 体温 est '
                  'corporelle, non une prévision météo.'},
 3580: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 3618: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3619: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3625: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3626: {'destination': 'vocab-nature',
        'reason': 'Nom du monde naturel, plante ou repère météorologique lu dans la cible ; pas de '
                  'transfert fondé sur un emploi figuré du français.'},
 3630: {'destination': 'vocab-voyage',
        'reason': 'Action de déplacement, change de monnaie ou sortie d’hôtel effectivement exprimée '
                  'par la cible et son sens entier.'},
 3657: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3661: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3663: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3680: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3697: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 3871: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3872: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3873: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 3874: {'destination': 'vocab-reperes',
        'reason': 'Localisateur spatial général dans le sens source ; aucune situation de transport '
                  'particulière n’est exprimée.'},
 3879: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3880: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3881: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3882: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3883: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3884: {'destination': 'vocab-maison',
        'reason': 'Équipement, appareil ou élément matériel du logement/bâtiment explicitement désigné '
                  '; sens propre conservé.'},
 3885: {'destination': 'vocab-voyage',
        'reason': 'Infrastructure de circulation ou de passage réelle ; 红绿灯 désigne un feu de '
                  'circulation, pas une couleur isolée.'},
 3886: {'destination': 'vocab-voyage',
        'reason': 'Infrastructure de circulation ou de passage réelle ; 红绿灯 désigne un feu de '
                  'circulation, pas une couleur isolée.'},
 3887: {'destination': 'vocab-voyage',
        'reason': 'Infrastructure de circulation ou de passage réelle ; 红绿灯 désigne un feu de '
                  'circulation, pas une couleur isolée.'},
 3889: {'destination': 'vocab-voyage',
        'reason': 'Infrastructure de circulation ou de passage réelle ; 红绿灯 désigne un feu de '
                  'circulation, pas une couleur isolée.'},
 3890: {'destination': 'vocab-voyage',
        'reason': 'Infrastructure de circulation ou de passage réelle ; 红绿灯 désigne un feu de '
                  'circulation, pas une couleur isolée.'},
 3915: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 3922: {'destination': 'vocab-reperes',
        'reason': 'Groupe de quantité ou unité de comptage lu dans la cible chinoise ; ce n’est ni un '
                  'nombre pur ni un objet domestique ou une douleur.'},
 3978: {'destination': 'vocab-actions',
        'reason': 'Connecteur ou renvoi discursif complet comme entrée lexicale ; aucune action de '
                  'voyager ni repère temporel matériel n’est fournie.'},
 3988: {'destination': 'vocab-actions',
        'reason': 'Connecteur ou renvoi discursif complet comme entrée lexicale ; aucune action de '
                  'voyager ni repère temporel matériel n’est fournie.'},
 4039: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4080: {'destination': 'vocab-travail',
        'reason': 'Programme d’action, solution ou conduite d’un ensemble de tâches ; le sens est '
                  'organisationnel, sans trajet ni objet domestique.'},
 4093: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4144: {'destination': 'vocab-travail',
        'reason': 'Terme de transaction professionnelle, fixation de prix, coût, crédit ou règlement '
                  'marchand ; il ne désigne pas un aliment ou une commande au café.'},
 4316: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4331: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4353: {'destination': 'vocab-travail',
        'reason': 'Programme d’action, solution ou conduite d’un ensemble de tâches ; le sens est '
                  'organisationnel, sans trajet ni objet domestique.'},
 4388: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4399: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4411: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4412: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4414: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4509: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4560: {'destination': 'vocab-actions',
        'reason': 'Téléphone comme objet de communication général ; l’entrée ne nomme pas un meuble ou '
                  'un élément de la maison.'},
 4598: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4731: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4747: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'},
 4752: {'destination': 'vocab-actions',
        'reason': 'Locution ou notion générale lue en chinois : le corps, la nourriture, la maison ou '
                  'le déplacement de la traduction relèvent ici d’une image, d’une stratégie ou d’un '
                  'sens abstrait.'}}

SITUATION_DOMAIN_OVERRIDES = {22: {'destination': 'conversation',
      'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 26: {'destination': 'conversation',
      'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 118: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 155: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 188: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 189: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 210: {'destination': 'saluer',
       'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le déplacement '
                 'apparent ne constitue pas le but communicatif.'},
 253: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 311: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 319: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 329: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 345: {'destination': 'saluer',
       'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le déplacement '
                 'apparent ne constitue pas le but communicatif.'},
 361: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 362: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 389: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 397: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 401: {'destination': 'repas',
       'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                 'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 406: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 456: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 462: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 493: {'destination': 'repas',
       'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                 'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 535: {'destination': 'ressentis',
       'reason': 'Soutien, réconfort, excitation ou sentiment d’intégration ; la place, l’arrivée ou '
                 'l’immobilité sont ici des états ressentis, pas un itinéraire.'},
 680: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 692: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 700: {'destination': 'deplacements',
       'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                 'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 756: {'destination': 'repas',
       'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                 'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 766: {'destination': 'deplacements',
       'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                 'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 781: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 789: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 806: {'destination': 'decrire',
       'reason': 'Caractéristique ou comparaison d’un objet/produit réellement formulée ; le prix n’est '
                 'pas une commande au restaurant.'},
 843: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 878: {'destination': 'saluer',
       'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le déplacement '
                 'apparent ne constitue pas le but communicatif.'},
 886: {'destination': 'deplacements',
       'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                 'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 913: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 920: {'destination': 'conversation',
       'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                 'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 949: {'destination': 'quotidien',
       'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                 'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 955: {'destination': 'travail',
       'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                 'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un trajet.'},
 1042: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1091: {'destination': 'conversation',
        'reason': 'Deux prédications parallèles d’un conseil général sont conservées entières ; il ne '
                  's’agit pas d’un mot désignant une personne.'},
 1109: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1110: {'destination': 'repas',
        'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                  'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 1117: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1119: {'destination': 'repas',
        'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                  'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 1154: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1201: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1214: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1235: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1239: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1245: {'destination': 'decrire',
        'reason': 'Caractéristique ou comparaison d’un objet/produit réellement formulée ; le prix '
                  'n’est pas une commande au restaurant.'},
 1271: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1275: {'destination': 'ressentis',
        'reason': 'Soutien, réconfort, excitation ou sentiment d’intégration ; la place, l’arrivée ou '
                  'l’immobilité sont ici des états ressentis, pas un itinéraire.'},
 1276: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1308: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1325: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1347: {'destination': 'ressentis',
        'reason': 'Soutien, réconfort, excitation ou sentiment d’intégration ; la place, l’arrivée ou '
                  'l’immobilité sont ici des états ressentis, pas un itinéraire.'},
 1361: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1367: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1378: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1386: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1409: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1436: {'destination': 'saluer',
        'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le '
                  'déplacement apparent ne constitue pas le but communicatif.'},
 1465: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1476: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1480: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1483: {'destination': 'ressentis',
        'reason': 'Soutien, réconfort, excitation ou sentiment d’intégration ; la place, l’arrivée ou '
                  'l’immobilité sont ici des états ressentis, pas un itinéraire.'},
 1504: {'destination': 'decrire',
        'reason': 'Caractéristique ou comparaison d’un objet/produit réellement formulée ; le prix '
                  'n’est pas une commande au restaurant.'},
 1526: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1534: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1538: {'destination': 'decrire',
        'reason': 'Caractéristique ou comparaison d’un objet/produit réellement formulée ; le prix '
                  'n’est pas une commande au restaurant.'},
 1562: {'destination': 'comprendre',
        'reason': 'Démonstration, explication, reformulation, demande d’aide ou interprétation d’un '
                  'propos ; le sens figuré n’est pas un déplacement matériel.'},
 1574: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1594: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1617: {'destination': 'ressentis',
        'reason': 'Soutien, réconfort, excitation ou sentiment d’intégration ; la place, l’arrivée ou '
                  'l’immobilité sont ici des états ressentis, pas un itinéraire.'},
 1631: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1667: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1669: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1670: {'destination': 'saluer',
        'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le '
                  'déplacement apparent ne constitue pas le but communicatif.'},
 1704: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1705: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1725: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1726: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1739: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1772: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1785: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1803: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1807: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1845: {'destination': 'repas',
        'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                  'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 1895: {'destination': 'deplacements',
        'reason': 'Billet de transport/visite, change de devises, équipement d’hôtel ou itinéraire '
                  'explicitement exprimé ; pas une affectation tirée du seul prix.'},
 1915: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1916: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1957: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1958: {'destination': 'comprendre',
        'reason': 'Démonstration, explication, reformulation, demande d’aide ou interprétation d’un '
                  'propos ; le sens figuré n’est pas un déplacement matériel.'},
 1965: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1973: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 1986: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1988: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 1989: {'destination': 'saluer',
        'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le '
                  'déplacement apparent ne constitue pas le but communicatif.'},
 1991: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1993: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 1995: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2000: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2001: {'destination': 'saluer',
        'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le '
                  'déplacement apparent ne constitue pas le but communicatif.'},
 2006: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2007: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2008: {'destination': 'comprendre',
        'reason': 'Démonstration, explication, reformulation, demande d’aide ou interprétation d’un '
                  'propos ; le sens figuré n’est pas un déplacement matériel.'},
 2009: {'destination': 'comprendre',
        'reason': 'Démonstration, explication, reformulation, demande d’aide ou interprétation d’un '
                  'propos ; le sens figuré n’est pas un déplacement matériel.'},
 2013: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2014: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2032: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2049: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2052: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2053: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2059: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 2060: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2062: {'destination': 'ressentis',
        'reason': 'La cible exprime une impression étrange et une hésitation pour la formuler ; aucun '
                  'implicite à décoder n’est fourni dans cette entrée.'},
 2063: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 2064: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2071: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2099: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2103: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2104: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2106: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2130: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2146: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2147: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2151: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2164: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2412: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 2415: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2524: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2563: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2616: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 2662: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2665: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2694: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2725: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2732: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2740: {'destination': 'saluer',
        'reason': 'Civilité, origine, première rencontre ou clôture réellement exprimée ; le '
                  'déplacement apparent ne constitue pas le but communicatif.'},
 2742: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 2817: {'destination': 'conversation',
        'reason': '再来一个 est une demande autonome d’un exemplaire supplémentaire ; l’entrée ne donne ni '
                  'date ni repère de temps.'},
 2870: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 3144: {'destination': 'repas',
        'reason': 'Cuisine, menu, achat/retour de produit, taille ou monnaie effectivement visés ; la '
                  'cible chinoise distingue notamment 钞票 (billet de banque) d’un titre de transport.'},
 3378: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 4520: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4703: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4739: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4740: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4760: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4770: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4771: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4783: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4801: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4840: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4841: {'destination': 'comprendre',
        'reason': 'Démonstration, explication, reformulation, demande d’aide ou interprétation d’un '
                  'propos ; le sens figuré n’est pas un déplacement matériel.'},
 4848: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'},
 4860: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 4861: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 4865: {'destination': 'travail',
        'reason': 'Projet, collaboration, lot marchand, devis, prix professionnel ou responsabilité de '
                  'poste explicitement présents ; l’objet communicatif n’est pas un repas ou un '
                  'trajet.'},
 4871: {'destination': 'quotidien',
        'reason': 'Événement domestique, loisir, météo, connexion ou organisation du quotidien ; la '
                  'présence de venir/aller/ici dans le sens ne suffit pas à en faire un trajet.'},
 4901: {'destination': 'conversation',
        'reason': 'Réplique générale, conseil, stratégie ou image idiomatique lus dans la cible ; aucun '
                  'repas, trajet ou objet descriptif littéral n’est le sujet de l’entrée.'}}


def classify_card(card, source_index=None):
    assignment = classify_semantic(card, source_index)
    if source_index == 1091:
        assignment = result("utterance", "Deux prédications parallèles complètes : apprendre sans lassitude et enseigner sans fatigue ; aucune troncature n’est créée.", True)
    if source_index == 3795:
        assignment = result("incomplete", "如有需要 est une condition ouverte (« si besoin »), sans proposition principale dans la source.", True)
    if assignment["contentType"] == "vocabulary":
        assignment.update(classify_lexical(card))
        override = LEXICAL_FAMILY_OVERRIDES.get(source_index)
        if override:
            assignment.update(lexicalFamilyOverride=override["destination"], lexicalFamilyOverrideReason=override["reason"], reviewStatus="reviewed")
            for key in ("previousFamily", "lexicalUsage", "consolidationReason"):
                if key in override:
                    assignment[key] = override[key]
    elif assignment["contentType"] == "utterance":
        override = SITUATION_DOMAIN_OVERRIDES.get(source_index)
        if override:
            assignment.update(situationDomainOverride=override["destination"], situationDomainOverrideReason=override["reason"], reviewStatus="reviewed")
    return assignment


def read_deck():
    line = next(line for line in APP.read_text().splitlines() if line.startswith("var DECKS = "))
    return json.loads(line.split("=", 1)[1].strip().rstrip(";"))["zh"]


def make():
    deck = read_deck()
    assignments = [dict(sourceIndex=i, **classify_card(card, i)) for i, card in enumerate(deck)]
    assert len(assignments) == 4903
    assert [row["sourceIndex"] for row in assignments] == list(range(len(deck)))
    canonical = json.dumps(deck, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    data = {"version": 1, "pair": "fr-zh", "studyLanguage": "zh",
            "sourceDeckSha256": hashlib.sha256(canonical).hexdigest(),
            "status": "candidate-requires-semantic-review", "assignments": assignments}
    return deck, data


def markdown(deck, data):
    counts = Counter(row["contentType"] for row in data["assignments"])
    lines = ["# Types de contenu — chinois pour francophones", "",
        "Classification sémantique candidate des 4 903 cartes de `DECKS.zh`, sans découpage ni modification des textes, niveaux ou phonétiques.", "",
        "| Type | Cartes |", "|---|---:|"]
    lines += [f"| {kind} | {counts[kind]} |" for kind in ("utterance", "vocabulary", "number", "incomplete", "review")]
    lexical_counts = Counter(row["lexicalClass"] for row in data["assignments"] if row["contentType"] == "vocabulary")
    lines += ["", "| Classe du vocabulaire chinois | Cartes |", "|---|---:|"]
    lines += [f"| {kind} | {lexical_counts[kind]} |" for kind in ("adjective", "color", "preposition", "adverb", "other", "uncertain")]
    lines += ["", "## Frontières retenues", "",
        "- `utterance` : énoncé ou réplique autonome. Bonjour, merci, oui, une consigne et une réponse elliptique conventionnelle ne nécessitent pas un sujet et un verbe explicites.",
        "- `vocabulary` : nom, adjectif, verbe à l’infinitif dans le sens source, locution ou groupe nominal. Les quantités avec unité (`两个`, `两个人`, `一杯水`), les horaires isolés et les jours de semaine restent ici.",
        "- `number` : nombre, ordinal ou fraction seul. Une phrase qui mentionne un nombre ne quitte pas les énoncés.",
        "- `incomplete` : modèle à emplacement, amorce ouverte ou particule grammaticale liée. Rien n’est complété automatiquement.",
        "- `review` : l’autonomie sémantique reste incertaine. Ces éléments sont réservés, pas présentés comme des phrases sûres.", "",
        "Les classes grammaticales portent sur le chinois : `我很累` reste un énoncé, `累` est un adjectif isolé. `都` et `也` sont des adverbes ; `里面` est un localisateur, non une préposition copiée de « à l’intérieur ». Les noms de temps (`今天`, `下午`) ne deviennent pas automatiquement des adverbes. Les noms de couleur isolés sont désormais `color`, tandis que les fleurs, fruits et phrases avec une couleur conservent leur propre sens. Les groupes relationnels bornés peuvent rejoindre `preposition` ; les amorces à complément ou emplacement explicitement ouvert restent réservées ou incomplètes.", "",
        "Les clés `lexicalClass`, `lexicalClassReason` et `lexicalClassReviewStatus` existent uniquement sur les entrées de vocabulaire. La rubrique grammaticale canonique ne duplique pas une carte dans un thème. `uncertain` réserve les emplois polyfonctionnels que le sens source ne tranche pas ; `other` conserve noms, verbes, groupes de quantité et locutions hors des trois classes demandées.", "",
        "Les catégories `cat` et `pedagogicalStatus` ne suffisent jamais. La forme chinoise et son sens français sont lus ensemble ; aucune frontière n’est fondée sur la seule longueur. Les normalisations servent aux règles de repérage et ne sont jamais réécrites dans le catalogue.", "",
        "`reviewed` désigne ici une décision sémantique explicite sur un mot ou une formule ; ce n’est ni une validation native ni une validation phonétique de la méthode. Les autres décisions restent `rule-based-candidate`.", "",
        "## Contrôle ciblé des catégories source", "",
        "Le total lexical dépasse `cat:vocab` parce que le catalogue range aussi les séries de mots dans `core`, `biz`, `basics` et `trip`. Une contre-lecture des candidats lexicaux a retiré les prédications et demandes chinoises dont le sens français est nominalisé : `质量很好`, `加我微信`, `订单增加了`, `你先走`. Les phrases complètes `我想…`, `我要…`, `请…` avec leur contenu ne deviennent pas lexicales par la seule présence d’un infinitif dans leur traduction.", "",
        "| Catégorie source | Énoncés | Vocabulaire | Nombres | Incomplets | Réserve |", "|---|---:|---:|---:|---:|---:|"]
    for cat in sorted({c.get("cat", "") for c in deck}):
        cross = Counter(row["contentType"] for c, row in zip(deck, data["assignments"]) if c.get("cat", "") == cat)
        lines.append(f"| {cat} | " + " | ".join(str(cross[k]) for k in ("utterance", "vocabulary", "number", "incomplete", "review")) + " |")
    lines += ["", "## Contre-exemples vérifiables", "", "| Indice | Catégorie source | Texte | Sens | Type candidat |", "|---|---|---|---|---|"]
    for i in [0,2,2168,2207,2223,39,2235,2300,2301,2305,2306,2308,2385,2779,2786,2787,2793,2852,2948,3071,3334,3902,4816,147,2234,2411,2970,2242,2866,2934,2935,2936,2843,2846,2923,2459,3065,2219]:
        c, row = deck[i], data["assignments"][i]
        lines.append(f"| {i} | {c.get('cat', '')} | {c['t']} | {c.get('frm', '')} | {row['contentType']} |")
    lines += ["", "## Réserve de relecture", "", "| Indice | Texte | Sens source |", "|---|---|---|"]
    for row in data["assignments"]:
        if row["contentType"] == "review":
            c = deck[row["sourceIndex"]]
            lines.append(f"| {row['sourceIndex']} | {c['t']} | {c.get('frm', '')} |")
    routing_counts = Counter("lexicalFamilyOverride" if "lexicalFamilyOverride" in row else "situationDomainOverride" for row in data["assignments"] if "lexicalFamilyOverride" in row or "situationDomainOverride" in row)
    lines += ["", "## Corrections sémantiques de routage", "",
        f"Décisions explicites par indice : {routing_counts['lexicalFamilyOverride']} affectations lexicales et {routing_counts['situationDomainOverride']} affectations de situation. Les champs `lexicalFamilyOverride` / `situationDomainOverride` portent une raison dédiée et un statut `reviewed` ; ils corrigent les emplois figurés ou les noms mal dirigés sans toucher à la source.", "",
        "Les noms concrets de nature, jardin et météo rejoignent `vocab-nature` ; films, musique, lecture et culture rejoignent `vocab-loisirs`. `vocab-maison` garde les pièces, objets et équipements du logement. Les six couleurs isolées existantes rejoignent `color`, distinct de rouge de honte, Bluetooth, feu de circulation, fleur ou fruit.", "",
        "Le contrôle des 43 rubriques courantes de moins de six entrées, les erreurs constatées et les introductions proposées d’adjectifs existants sont détaillés dans [corrections-themes/fr-zh.md](../corrections-themes/fr-zh.md). Il ne prétend pas enrichir une rubrique en y déplaçant des mots hors sujet."]

    lines += ["", "## Reproduction", "", "```sh", "python3 tools/maquette-guidee/classify_zh.py", "python3 tools/maquette-guidee/classify_zh.py --check", "```", "",
        f"Empreinte canonique du deck : `{data['sourceDeckSha256']}`.", "",
        "Une affectation existe exactement pour chaque indice 0–4902. Les doublons de texte ne sont pas fusionnés. Aucune phrase, lecture, traduction ou phonétique n’est produite ou retouchée par cet outil."]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    deck, data = make()
    outputs = {JSON_PATH: json.dumps(data, ensure_ascii=False, indent=2) + "\n",
               MD_PATH: markdown(deck, data)}
    for path, text in outputs.items():
        if args.check:
            assert path.exists() and path.read_text() == text, f"Out of date: {path.relative_to(ROOT)}"
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    print(json.dumps(dict(Counter(row["contentType"] for row in data["assignments"])), ensure_ascii=False))


if __name__ == "__main__":
    main()
