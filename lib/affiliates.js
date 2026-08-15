"use strict";
// 楽天アフィリエイト（専用楽天アカウント）。検索リンクはID固定・pc=差し替えで構築（curl 302検証済み）
const LINK_ID = "56939e6e.b614e71e.56939e6f.e56659e4";
const UT = "eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9";
const searchLink = keyword =>
  `https://hb.afl.rakuten.co.jp/hgc/${LINK_ID}/?pc=${encodeURIComponent(`https://search.rakuten.co.jp/search/mall/${keyword}/`)}&link_type=text&ut=${UT}`;

// ライフイベント連動の文脈リンク（イベントが直近に迫っている生まれ年のページだけに出す）
const EVENT_GOODS = {
  randoseru: { label: "ランドセル（楽天市場で人気順に見る）", keyword: "ランドセル", note: "小学校入学の1年前（年中〜年長の春）が購入のピークです" },
  seijin: { label: "振袖レンタル", keyword: "振袖 レンタル", note: "二十歳のつどいの振袖は1年以上前からの予約が主流です" },
  kanreki: { label: "還暦祝いのプレゼント", keyword: "還暦祝い プレゼント", note: "赤いちゃんちゃんこ以外にも名入れギフトが定番です" },
  koki: { label: "古希のお祝いギフト", keyword: "古希 お祝い", note: "古希のテーマカラーは紫です" },
  beiju: { label: "米寿のお祝いギフト", keyword: "米寿 お祝い", note: "米寿のテーマカラーは金茶・黄色です" },
};
for (const k of Object.keys(EVENT_GOODS)) EVENT_GOODS[k].url = searchLink(EVENT_GOODS[k].keyword);

module.exports = { EVENT_GOODS, searchLink };
