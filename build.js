"use strict";
// 年齢早見表 静的サイトジェネレータ
// 生成物: docs/ 以下に index.html + 生まれ年別ページ + コラム3本 + sitemap.xml + 404.html
const fs = require("fs");
const path = require("path");
const { eto, etoYomi, wareki, ageInYear, kazoe, schoolYears, YAKU, CHOJU } = require("./lib/nenrei");
const { EVENT_GOODS } = require("./lib/affiliates");

const BASE = "https://claudetarouggl-coder.github.io/nenrei-hayami/";
const GA_ID = "G-CDFZWP83ZH";
const OUT = path.join(__dirname, "docs");

const jstNow = new Date(Date.now() + 540 * 60000);
const THIS_YEAR = jstNow.getUTCFullYear();
const TODAY_STR = `${THIS_YEAR}-${String(jstNow.getUTCMonth() + 1).padStart(2, "0")}-${String(jstNow.getUTCDate()).padStart(2, "0")}`;

const FIRST_YEAR = 1920;
const YEARS = [];
for (let y = FIRST_YEAR; y <= THIS_YEAR; y++) YEARS.push(y);

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const emittedUrls = [];
const linkTargets = new Set();
const canonical = p => BASE + p;
function rel(depth, target) {
  linkTargets.add(target);
  return target ? "../".repeat(depth) + target : (depth ? "../".repeat(depth) : "./");
}

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;color:#332e28;background:#faf7f2;line-height:1.7}
main{max-width:860px;margin:0 auto;padding:1rem}
header.site{background:linear-gradient(135deg,#5b4a8a,#8a6bb8);padding:1.2rem 1rem .9rem;text-align:center}
header.site a{color:#fff;text-decoration:none;font-weight:bold;font-size:1.05rem}
h1{font-size:1.35rem;margin:.8rem 0 .3rem}
h2{font-size:1.1rem;margin:1.6rem 0 .5rem;border-left:4px solid #8a6bb8;padding-left:.5rem}
h3{font-size:.98rem;margin:1rem 0 .3rem}
nav.bc{font-size:.8rem;color:#7a7266;margin:.5rem 0}
nav.bc a{color:#5b4a8a}
.cards,.feature,.faq,.note{background:#fff;border:1px solid #e5ddd0;border-radius:10px;padding:1rem;margin:.8rem 0}
.cards{display:flex;gap:1.2rem;flex-wrap:wrap;justify-content:center;text-align:center}
.cards .f .lb{font-size:.75rem;color:#7a7266}
.cards .f .vl{font-size:1.5rem;font-weight:bold;color:#5b4a8a}
.tbl{overflow-x:auto;background:#fff;border:1px solid #e5ddd0;border-radius:10px;margin:.8rem 0}
table{border-collapse:collapse;width:100%;font-size:.88rem;white-space:nowrap}
th,td{padding:.4rem .6rem;text-align:center;border-bottom:1px solid #f0e9dd}
th{background:#f3eee5;font-weight:600}
.faq dt{font-weight:600;margin-top:.6rem}.faq dd{margin-left:0;color:#5c5548}
.links{display:flex;flex-wrap:wrap;gap:.5rem;margin:.6rem 0}
.links a{background:#fff;border:1px solid #e5ddd0;border-radius:999px;padding:.3rem .8rem;font-size:.85rem;text-decoration:none;color:#5b4a8a}
a{color:#5b4a8a}
.goods li{margin:.35rem 0 .35rem 1.2em}
footer{margin:2rem 0 1rem;color:#7a7266;font-size:.75rem;text-align:center;line-height:1.9}
.note{font-size:.88rem;color:#5c5548}
tr.hl{background:#f2edfa}
`.trim();

function shell({ path: pagePath, depth, title, desc, h1, breadcrumbs, body, extraHead = "", extraScript = "" }) {
  const canon = canonical(pagePath);
  emittedUrls.push(canon);
  const gtag = GA_ID ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>` : "";
  const bcJson = breadcrumbs.length ? `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem", position: i + 1, name: b.name, item: canonical(b.path),
    })),
  })}</script>` : "";
  const bcNav = breadcrumbs.length > 1 ? `<nav class="bc">${breadcrumbs.map((b, i) =>
    i === breadcrumbs.length - 1 ? esc(b.name) : `<a href="${rel(depth, b.path)}">${esc(b.name)}</a>`).join(" › ")}</nav>` : "";
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎂</text></svg>">${gtag}
${bcJson}${extraHead}
<style>${CSS}</style>
</head>
<body>
<header class="site"><a href="${rel(depth, "")}">年齢早見表</a></header>
<main>
${bcNav}
<h1>${esc(h1)}</h1>
${body}
<footer>
年齢は「その年の誕生日を迎えた後」の満年齢で表記しています。<br>
厄年・長寿祝いは数え年（還暦のみ満60歳の年）で、地域や寺社により数え方が異なる場合があります。
</footer>
</main>
${extraScript}
</body>
</html>`;
}

function writePage(relPath, html) {
  const file = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const columnLinks = depth => `<h2>あわせて読む</h2><div class="links">
<a href="${rel(depth, "gakunen/")}">学年早見表 ${THIS_YEAR}年度</a>
<a href="${rel(depth, "eto/")}">干支早見表</a>
<a href="${rel(depth, "column/hayaumare/")}">早生まれとは？学年の区切り</a>
<a href="${rel(depth, "column/kazoedoshi/")}">数え年と満年齢の違い</a>
<a href="${rel(depth, "column/yakudoshi/")}">厄年早見表 ${THIS_YEAR}・${THIS_YEAR + 1}</a></div>`;

// 誕生日前後で変わる年齢表示を、閲覧時の年に合わせてクライアント側で更新する
const refreshScript = `<script>
(function(){
  var y=new Date(Date.now()+540*60000).getUTCFullYear();
  var baked=${THIS_YEAR};
  if(y===baked)return;
  document.querySelectorAll("[data-age-of]").forEach(function(el){
    el.textContent=y-parseInt(el.getAttribute("data-age-of"),10);
  });
  document.querySelectorAll("[data-age-before]").forEach(function(el){
    el.textContent=Math.max(0,y-parseInt(el.getAttribute("data-age-before"),10)-1);
  });
  document.querySelectorAll("[data-kazoe-of]").forEach(function(el){
    el.textContent=y-parseInt(el.getAttribute("data-kazoe-of"),10)+1;
  });
  document.querySelectorAll("[data-this-year]").forEach(function(el){el.textContent=y;});
})();
</script>`;

// ---- 生まれ年ページ ----
function affiliateForYear(y) {
  // 直近1〜2年にライフイベントを迎える生まれ年にだけ文脈リンクを出す
  const items = [];
  const win = ev => ev >= THIS_YEAR && ev <= THIS_YEAR + 2;
  if (win(schoolYears(y).elemIn)) items.push(EVENT_GOODS.randoseru);
  if (win(schoolYears(y).seijin) || win(schoolYears(y - 1).seijin)) items.push(EVENT_GOODS.seijin);
  if (win(y + 60)) items.push(EVENT_GOODS.kanreki);
  if (win(y + 69)) items.push(EVENT_GOODS.koki);   // 古希: 数え70 = 生まれ年+69
  if (win(y + 87)) items.push(EVENT_GOODS.beiju);  // 米寿: 数え88 = 生まれ年+87
  if (!items.length) return "";
  return `<section class="note goods"><h2>この年生まれの方の節目のお祝い<small>（広告を含みます）</small></h2><ul>${
    items.map(g => `<li><a href="${esc(g.url)}" rel="sponsored noopener" target="_blank">${esc(g.label)}</a> — ${esc(g.note)}</li>`).join("\n")
  }</ul></section>`;
}

function schoolTable(cohortYear, label) {
  const s = schoolYears(cohortYear);
  return `<h3>${esc(label)}</h3><div class="tbl"><table>
<thead><tr><th></th><th>入学</th><th>卒業</th></tr></thead><tbody>
<tr><td>小学校</td><td>${s.elemIn}年4月</td><td>${s.elemOut}年3月</td></tr>
<tr><td>中学校</td><td>${s.jhsIn}年4月</td><td>${s.jhsOut}年3月</td></tr>
<tr><td>高校</td><td>${s.hsIn}年4月</td><td>${s.hsOut}年3月</td></tr>
<tr><td>大学（4年制・現役）</td><td>${s.uniIn}年4月</td><td>${s.uniOut}年3月</td></tr>
<tr><td>二十歳のつどい（成人式）</td><td colspan="2">${s.seijin}年1月</td></tr>
</tbody></table></div>`;
}

function buildYearPage(y) {
  const age = ageInYear(y, THIS_YEAR);
  const ageBefore = Math.max(0, age - 1);
  const kz = kazoe(y, THIS_YEAR);
  const w = wareki(y);
  const yakuRows = gender => YAKU[gender].map(a => {
    const hon = y + a - 1;
    return `<tr><td>数え${a}歳</td><td>${hon - 1}年</td><td><strong>${hon}年</strong></td><td>${hon + 1}年</td></tr>`;
  }).join("\n");
  const chojuRows = [`<tr><td>還暦（満60歳）</td><td><strong>${y + 60}年</strong></td></tr>`]
    .concat(CHOJU.map(([name, a]) => `<tr><td>${name}（数え${a}歳）</td><td><strong>${y + a - 1}年</strong></td></tr>`)).join("\n");

  const prev = y > FIRST_YEAR ? `<a href="${rel(1, `y${y - 1}/`)}">← ${y - 1}年生まれ</a>` : "<span></span>";
  const next = y < THIS_YEAR ? `<a href="${rel(1, `y${y + 1}/`)}">${y + 1}年生まれ →</a>` : "<span></span>";

  const body = `
<div class="cards">
<div class="f"><div class="lb"><span data-this-year>${THIS_YEAR}</span>年に迎える年齢</div><div class="vl"><span data-age-of="${y}">${age}</span>歳</div><div class="lb">誕生日前は <span data-age-before="${y}">${ageBefore}</span>歳</div></div>
<div class="f"><div class="lb">和暦</div><div class="vl" style="font-size:1.15rem">${esc(w)}</div></div>
<div class="f"><div class="lb">干支</div><div class="vl">${eto(y)}<small>（${etoYomi(y)}）</small></div></div>
<div class="f"><div class="lb">数え年</div><div class="vl"><span data-kazoe-of="${y}">${kz}</span>歳</div></div>
</div>
<section class="feature"><p>${y}年（${esc(w)}）生まれの方は、${THIS_YEAR}年の誕生日で<strong>${age}歳</strong>になります（誕生日前は${ageBefore}歳）。干支は${eto(y)}年（${etoYomi(y)}どし）、数え年は${kz}歳です。</p></section>
${affiliateForYear(y)}
<h2>学年と入学・卒業年</h2>
<p>学年は4月2日〜翌年4月1日生まれで区切られます。${y}年1月1日〜4月1日生まれの方は「早生まれ」で、1つ上の学年になります。</p>
${schoolTable(y, `${y}年4月2日〜12月31日生まれの方`)}
${schoolTable(y - 1, `${y}年1月1日〜4月1日生まれの方（早生まれ）`)}
<h2>厄年（数え年）</h2>
<h3>男性</h3><div class="tbl"><table><thead><tr><th>本厄の年齢</th><th>前厄</th><th>本厄</th><th>後厄</th></tr></thead><tbody>${yakuRows("male")}</tbody></table></div>
<h3>女性</h3><div class="tbl"><table><thead><tr><th>本厄の年齢</th><th>前厄</th><th>本厄</th><th>後厄</th></tr></thead><tbody>${yakuRows("female")}</tbody></table></div>
<h2>長寿祝いの年</h2>
<div class="tbl"><table><thead><tr><th>お祝い</th><th>年</th></tr></thead><tbody>${chojuRows}</tbody></table></div>
<div style="display:flex;justify-content:space-between;margin:1rem 0">${prev}${next}</div>
<p><a href="${rel(1, "")}">全生まれ年の一覧表に戻る</a></p>
${columnLinks(1)}`;

  writePage(`y${y}/index.html`, shell({
    path: `y${y}/`, depth: 1,
    title: `${y}年（${w}）生まれは何歳？年齢・学年・干支・厄年早見`,
    desc: `${y}年（${w}）生まれの方は${THIS_YEAR}年の誕生日で${age}歳（誕生日前は${ageBefore}歳）。干支は${eto(y)}、数え年${kz}歳。学年の入学・卒業年、成人式の年、男女の厄年、還暦などの長寿祝いの年もまとめて確認できます。`,
    h1: `${y}年（${w}）生まれの年齢早見`,
    breadcrumbs: [{ name: "年齢早見表", path: "" }, { name: `${y}年生まれ`, path: `y${y}/` }],
    body,
    extraScript: refreshScript,
  }));
}

// ---- コラム ----
function buildColumn(slug, title, descText, h1, bodyHtml) {
  writePage(`column/${slug}/index.html`, shell({
    path: `column/${slug}/`, depth: 2,
    title, desc: descText, h1,
    breadcrumbs: [{ name: "年齢早見表", path: "" }, { name: h1, path: `column/${slug}/` }],
    body: bodyHtml,
  }));
}

function buildColumns() {
  buildColumn("hayaumare",
    "早生まれとは？1月1日〜4月1日生まれの学年の仕組み",
    "早生まれは1月1日〜4月1日生まれのこと。同じ年に生まれた4月2日以降の人より1つ上の学年になります。なぜ4月1日生まれまでが上の学年なのか、法律上の理由もあわせて解説します。",
    "早生まれとは？学年の区切りの仕組み", `
<section class="feature"><p>「早生まれ」とは<strong>1月1日〜4月1日生まれ</strong>のことです。学年は「4月2日生まれ〜翌年4月1日生まれ」で1つの区切りなので、早生まれの人は同じ年に生まれた4月2日以降の人より1つ上の学年に入ります。</p></section>
<h2>なぜ「4月1日」までが上の学年？</h2>
<p>学校教育法は「満6歳に達した日の翌日以降における最初の学年の初め」から就学すると定めています。そして年齢計算に関する法律では、<strong>誕生日の前日が終わる瞬間に年をとる</strong>とされています。4月1日生まれの人は3月31日の終わりに満6歳になるため、4月1日から始まる学年に「すでに6歳に達した者」として組み込まれる——これが4月1日生まれだけが上の学年になる理由です。</p>
<h2>早生まれの実務あるある</h2>
<ul style="margin-left:1.2em">
<li>同学年の中では誕生日が遅いため、子どものうちは体格・発達の差が出やすい</li>
<li>免許取得や成人年齢の到達が同学年より遅い（高3の間に18歳にならない人もいる）</li>
<li>学年基準の表（成人式・入学年）を見るときは「1つ前の年の欄」を見る必要がある</li>
</ul>
<p>生まれ年ごとのページでは、早生まれの方用の入学・卒業年表を分けて掲載しています。<a href="${rel(2, "")}">一覧表から生まれ年を選ぶ</a></p>
${columnLinks(2)}`);

  buildColumn("kazoedoshi",
    "数え年と満年齢の違い｜計算方法と使い分け",
    "数え年は生まれた時点を1歳とし、元日が来るたびに1歳増える数え方。満年齢との差は最大2歳になります。七五三・厄年・長寿祝いなど数え年を使う場面と、簡単な計算方法を解説します。",
    "数え年と満年齢の違い", `
<section class="feature"><p><strong>満年齢</strong>は生まれた日を0歳とし誕生日ごとに1歳増える現在の標準的な数え方。<strong>数え年</strong>は生まれた時点を1歳とし、<strong>元日（1月1日）が来るたびに</strong>1歳増える伝統的な数え方です。</p></section>
<h2>数え年の計算方法</h2>
<div class="tbl"><table><thead><tr><th>時期</th><th>数え年</th></tr></thead><tbody>
<tr><td>今年の誕生日がまだ来ていない</td><td>満年齢 + 2歳</td></tr>
<tr><td>今年の誕生日を迎えた後</td><td>満年齢 + 1歳</td></tr>
</tbody></table></div>
<p>簡単には「<strong>今年 − 生まれ年 + 1</strong>」で計算できます。12月31日生まれの赤ちゃんは、生まれた瞬間に1歳、翌日の元日に2歳になります（満年齢では0歳）。</p>
<h2>数え年を使う場面</h2>
<ul style="margin-left:1.2em">
<li><strong>厄年</strong> — 神社仏閣の厄年表は原則数え年です</li>
<li><strong>七五三</strong> — 伝統的には数え年ですが、現在は満年齢で行う家庭も多くどちらでも構いません</li>
<li><strong>長寿祝い</strong> — 古希・喜寿・米寿などは数え年が基本。還暦だけは「満60歳（暦が一巡する年）」で祝うのが通例です</li>
</ul>
${columnLinks(2)}`);

  const yakuTable = (year) => {
    const rows = [];
    for (const [gender, label] of [["male", "男性"], ["female", "女性"]]) {
      for (const a of YAKU[gender]) {
        const birthHon = year - a + 1;
        rows.push(`<tr><td>${label}</td><td>数え${a}歳</td><td>${birthHon + 1}年生まれ</td><td class="hl"><strong>${birthHon}年生まれ</strong>（${esc(wareki(birthHon))}）</td><td>${birthHon - 1}年生まれ</td></tr>`);
      }
    }
    return `<h2>${year}年の厄年</h2><div class="tbl"><table><thead><tr><th></th><th>本厄の年齢</th><th>前厄</th><th>本厄</th><th>後厄</th></tr></thead><tbody>${rows.join("\n")}</tbody></table></div>`;
  };
  buildColumn("yakudoshi",
    `厄年早見表 ${THIS_YEAR}年・${THIS_YEAR + 1}年｜男性・女性の生まれ年一覧`,
    `${THIS_YEAR}年・${THIS_YEAR + 1}年に厄年を迎える生まれ年の早見表。男性は数え25・42・61歳、女性は数え19・33・37・61歳が本厄です。前厄・後厄の生まれ年もあわせて掲載しています。`,
    `厄年早見表 ${THIS_YEAR}年・${THIS_YEAR + 1}年`, `
<section class="feature"><p>厄年は<strong>数え年</strong>で数えます。男性は数え25歳・42歳・61歳、女性は数え19歳・33歳・37歳・61歳が本厄で、その前後1年が前厄・後厄です。特に男性42歳・女性33歳は「大厄」と呼ばれます。</p></section>
${yakuTable(THIS_YEAR)}
${yakuTable(THIS_YEAR + 1)}
<section class="faq"><h2>よくある質問</h2><dl>
<dt>厄年の数え方は地域で違いますか？</dt><dd>数え年の基準日を元日とするのが一般的ですが、立春を基準にする寺社もあります。厄払いを受ける予定の寺社の表記に合わせるのが確実です。</dd>
<dt>厄払いはいつ行けばいいですか？</dt><dd>年明けから節分までに行く方が多いですが、一年中受け付けている寺社がほとんどです。日取りに迷う場合は<a href="https://claudetarouggl-coder.github.io/rokuyo-calendar/">六曜カレンダー</a>で大安などを確認する方もいます。</dd>
<dt>早生まれの場合はどうなりますか？</dt><dd>数え年は生まれた「年」だけで決まるため、早生まれかどうかは関係ありません。生まれ年の欄をそのまま見てください。</dd>
</dl></section>
${columnLinks(2)}`);
}

// ---- 学年早見表 ----
const GAKUNEN_ROWS = [
  { label: "年少（3歳児クラス）", offset: 4 },
  { label: "年中（4歳児クラス）", offset: 5 },
  { label: "年長（5歳児クラス）", offset: 6 },
  { label: "小学1年", offset: 7 },
  { label: "小学2年", offset: 8 },
  { label: "小学3年", offset: 9 },
  { label: "小学4年", offset: 10 },
  { label: "小学5年", offset: 11 },
  { label: "小学6年", offset: 12, gradKey: "elemOut" },
  { label: "中学1年", offset: 13 },
  { label: "中学2年", offset: 14 },
  { label: "中学3年", offset: 15, gradKey: "jhsOut" },
  { label: "高校1年", offset: 16 },
  { label: "高校2年", offset: 17 },
  { label: "高校3年", offset: 18, gradKey: "hsOut" },
  { label: "大学1年", offset: 19 },
  { label: "大学2年", offset: 20 },
  { label: "大学3年", offset: 21 },
  { label: "大学4年", offset: 22, gradKey: "uniOut" },
];

function buildGakunen() {
  const rows = GAKUNEN_ROWS.map(({ label, offset, gradKey }) => {
    const c = THIS_YEAR - offset;
    const age = THIS_YEAR - c;
    const grad = gradKey ? `${schoolYears(c)[gradKey]}年3月` : "—";
    return `<tr><td>${esc(label)}</td><td>${c}年4月2日〜${c + 1}年4月1日</td><td>${age}歳</td><td>${grad}</td>` +
      `<td><a href="${rel(1, `y${c}/`)}">${c}年生まれ</a> / <a href="${rel(1, `y${c + 1}/`)}">${c + 1}年早生まれ</a></td></tr>`;
  }).join("\n");

  const body = `
<section class="feature"><p>${THIS_YEAR}年度（${THIS_YEAR}年4月〜${THIS_YEAR + 1}年3月）の学年早見表です。生まれ年月日（4月2日〜翌4月1日区切り）から、今の学年がすぐわかります。</p></section>
<div class="tbl"><table>
<thead><tr><th>学年</th><th>生まれ（西暦）</th><th>年度内に迎える年齢</th><th>卒業予定年</th><th>生まれ年ページ</th></tr></thead>
<tbody>${rows}</tbody></table></div>
<div class="note"><p>各学年には、上記の生まれ年の4月2日〜12月31日生まれに加えて、<strong>翌年1月1日〜4月1日生まれ（早生まれ）</strong>も含まれます。詳しくは<a href="${rel(1, "column/hayaumare/")}">早生まれとは？学年の区切り</a>をご覧ください。</p></div>
<section class="faq"><h2>よくある質問</h2><dl>
<dt>今年度の小学1年生は何年生まれ？</dt><dd>${THIS_YEAR - 7}年4月2日〜${THIS_YEAR - 6}年4月1日生まれです。</dd>
<dt>学年はいつの時点で決まりますか？</dt><dd>4月1日時点で満6歳に達しているかどうかで、その春の小学校入学が決まります。誕生日の前日に年を取る法律上の扱いのため、4月1日生まれまでが1つ上の学年になります。</dd>
<dt>浪人・留年した場合は？</dt><dd>この表は現役で進学した場合の目安です。浪人・留年があると学年がずれます。</dd>
</dl></section>
${columnLinks(1)}`;

  writePage("gakunen/index.html", shell({
    path: "gakunen/", depth: 1,
    title: `学年早見表【${THIS_YEAR}年度】小学校・中学校・高校・大学の学年がわかる`,
    desc: `${THIS_YEAR}年度（${THIS_YEAR}年4月〜${THIS_YEAR + 1}年3月）の学年早見表。年少・年中・年長から小学校・中学校・高校・大学4年まで、生まれ年ごとの現在の学年と卒業予定年がひと目でわかります。早生まれ（1月1日〜4月1日生まれ）の学年もあわせて確認できます。`,
    h1: `学年早見表【${THIS_YEAR}年度】`,
    breadcrumbs: [{ name: "年齢早見表", path: "" }, { name: "学年早見表", path: "gakunen/" }],
    body,
  }));
}

// ---- 干支早見表 ----
function buildEto() {
  const nextYear = THIS_YEAR + 1;
  const nextEto = eto(nextYear);
  const nextYomi = etoYomi(nextYear);

  // 来年の干支の生まれ年一覧（新生児年を含む）。新生児年は生まれ年ページがまだ無いのでリンクなし
  const targetYears = [];
  for (let y = FIRST_YEAR; y <= nextYear; y++) if (eto(y) === nextEto) targetYears.push(y);
  const targetRows = targetYears.slice().reverse().map(y => {
    const ageLabel = y === nextYear ? `0歳（${y}年生まれ）` : `${nextYear - y}歳`;
    const link = y <= THIS_YEAR ? `<a href="${rel(1, `y${y}/`)}">${y}年生まれのページ</a>` : "—";
    return `<tr><td>${y}年（${esc(wareki(y))}）</td><td>${ageLabel}</td><td>${link}</td></tr>`;
  }).join("\n");

  // 十二支ごとの生まれ年一覧（子〜亥。並び順のみの定数で、判定はeto()に一本化）
  const JUNI_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const signIndex = Object.fromEntries(JUNI_ORDER.map((s, i) => [s, i]));
  const juniGroups = JUNI_ORDER.map(sign => ({ sign, years: [] }));
  for (const y of YEARS) juniGroups[signIndex[eto(y)]].years.push(y);
  const juniRows = juniGroups.map(g => {
    const cls = g.sign === nextEto ? ' class="hl"' : "";
    return `<tr${cls}><td>${g.sign}<small>（${etoYomi(g.years[0])}）</small></td><td style="white-space:normal;text-align:left">${g.years.join("・")}</td></tr>`;
  }).join("\n");

  const body = `
<section class="feature"><p>今年（${THIS_YEAR}年）の干支は<strong>${eto(THIS_YEAR)}</strong>（${etoYomi(THIS_YEAR)}）、来年（${nextYear}年）は<strong>${nextEto}</strong>（${nextYomi}）。干支は12年で一巡し、自分の干支の年は「年男・年女」と呼ばれます。</p></section>
<h2>来年 ${nextYear}年の${nextEto}年生まれ（年男・年女）</h2>
<div class="tbl"><table>
<thead><tr><th>生まれ年</th><th>${nextYear}年に迎える年齢</th><th>生まれ年ページ</th></tr></thead>
<tbody>${targetRows}</tbody></table></div>
<h2>十二支と生まれ年の早見表</h2>
<div class="tbl"><table>
<thead><tr><th>十二支</th><th>該当する生まれ年（${FIRST_YEAR}年〜${THIS_YEAR}年）</th></tr></thead>
<tbody>${juniRows}</tbody></table></div>
<div class="note"><p>干支の年の区切りについて、一般的なカレンダー上では1月1日で切り替わるものとして扱われます。一方で、旧暦の元日や節分（立春）を基準に干支が変わると考える伝統的な立場もあります。本ページの生まれ年は西暦の1月1日区切りで集計しています。</p></div>
<section class="faq"><h2>よくある質問</h2><dl>
<dt>${nextYear}年の干支は？</dt><dd>${nextEto}（${nextYomi}）年です。</dd>
<dt>年男・年女とは？</dt><dd>自分の生まれ年と同じ干支の年を迎える人のことです。12年に一度巡ってきて、数え年で12・24・36…歳の年にあたります。</dd>
<dt>干支と十二支の違いは？</dt><dd>厳密には「干支」は十干と十二支を組み合わせた60通りの呼び方ですが、一般には十二支（子・丑・寅…）を指して「干支」と呼ぶことが多いため、本ページもその慣用に従っています。</dd>
</dl></section>
<div class="note"><p>日取り選びには、六曜や一粒万倍日をまとめた<a href="https://claudetarouggl-coder.github.io/rokuyo-calendar/">六曜カレンダー</a>も参考になります。</p></div>
${columnLinks(1)}`;

  writePage("eto/index.html", shell({
    path: "eto/", depth: 1,
    title: "干支早見表｜今年・来年の干支と生まれ年",
    desc: `${THIS_YEAR}年の干支は${eto(THIS_YEAR)}年、${nextYear}年は${nextEto}年です。${nextYear}年に年男・年女を迎える生まれ年の一覧に加え、${FIRST_YEAR}年〜${THIS_YEAR}年生まれの干支を十二支ごとにまとめた早見表を掲載。年賀状の準備や干支占いの下調べにご利用いただけます。`,
    h1: "干支早見表｜今年・来年の干支と生まれ年",
    breadcrumbs: [{ name: "年齢早見表", path: "" }, { name: "干支早見表", path: "eto/" }],
    body,
  }));
}

// ---- トップページ ----
function buildHome() {
  const rows = [...YEARS].reverse().map(y => {
    const age = ageInYear(y, THIS_YEAR);
    const ageBefore = Math.max(0, age - 1);
    return `<tr><td><a href="${rel(0, `y${y}/`)}">${y}年</a></td><td>${esc(wareki(y))}</td><td><strong><span data-age-of="${y}">${age}</span>歳</strong></td><td><span data-age-before="${y}">${ageBefore}</span>歳</td><td>${eto(y)}</td><td><span data-kazoe-of="${y}">${kazoe(y, THIS_YEAR)}</span>歳</td></tr>`;
  }).join("\n");

  const body = `
<section class="feature"><p><span data-this-year>${THIS_YEAR}</span>年版の年齢早見表です。生まれ年（西暦・和暦）から今年の満年齢・数え年・干支がすぐわかります。生まれ年をクリックすると、学年の入学・卒業年、成人式の年、厄年、還暦などの長寿祝いの年まで確認できます。</p></section>
${columnLinks(0)}
<h2>年齢早見表（${FIRST_YEAR}年〜${THIS_YEAR}年生まれ）</h2>
<div class="tbl"><table>
<thead><tr><th>生まれ年</th><th>和暦</th><th>誕生日後</th><th>誕生日前</th><th>干支</th><th>数え年</th></tr></thead>
<tbody>${rows}</tbody></table></div>
<section class="faq"><h2>よくある質問</h2><dl>
<dt>「誕生日後」「誕生日前」とはどういう意味ですか？</dt><dd>満年齢は誕生日で1つ増えるため、同じ年でも誕生日を迎える前と後で年齢が異なります。今日が誕生日より前なら「誕生日前」の列を見てください。</dd>
<dt>数え年はどう計算していますか？</dt><dd>「今年 − 生まれ年 + 1」です。詳しくは<a href="${rel(0, "column/kazoedoshi/")}">数え年と満年齢の違い</a>をご覧ください。</dd>
<dt>学年を調べたいときは？</dt><dd>4月2日〜翌年4月1日生まれが同じ学年です。各生まれ年のページに、早生まれの方用の表も含めて入学・卒業年を掲載しています。</dd>
</dl></section>`;

  const websiteJson = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "WebSite",
    name: "年齢早見表", url: BASE,
  })}</script>`;

  writePage("index.html", shell({
    path: "", depth: 0,
    title: `年齢早見表【${THIS_YEAR}年版】西暦・和暦・干支・数え年つき`,
    desc: `${THIS_YEAR}年版の年齢早見表。${FIRST_YEAR}年〜${THIS_YEAR}年生まれの満年齢（誕生日前・後）・数え年・和暦・干支を一覧掲載。生まれ年ごとに学年の入学卒業年・成人式・厄年・長寿祝いの年も確認できます。`,
    h1: `年齢早見表（${THIS_YEAR}年版）`,
    breadcrumbs: [],
    body,
    extraHead: websiteJson,
    extraScript: refreshScript,
  }));
}

function build404() {
  writePage("404.html", `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>ページが見つかりません</title><style>${CSS}</style></head>
<body><main style="text-align:center;padding-top:3rem"><h1>ページが見つかりません</h1><p><a href="${BASE}">年齢早見表 トップへ</a></p></main></body></html>`);
}
function buildSitemap() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${emittedUrls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY_STR}</lastmod></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), xml);
}

// ---- 実行 ----
fs.rmSync(OUT, { recursive: true, force: true });
YEARS.forEach(buildYearPage);
buildColumns();
buildGakunen();
buildEto();
buildHome();
build404();
buildSitemap();
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

for (const t of linkTargets) {
  const f = path.join(OUT, t, "index.html");
  if (!fs.existsSync(f)) throw new Error(`BROKEN LINK TARGET: ${t}`);
}
const expected = 1 + YEARS.length + 3 + 1 + 1; // home + year pages + 3 columns + gakunen + eto
if (emittedUrls.length !== expected) throw new Error(`page count ${emittedUrls.length} != ${expected}`);
if (!emittedUrls.every(u => u.startsWith(BASE))) throw new Error("URL outside BASE");
console.log(`OK: ${emittedUrls.length} pages + 404 + sitemap generated for ${TODAY_STR}`);
