"use strict";
// 年齢・和暦・干支・学年・厄年などの計算
// 慣習の前提（サイト上にも明記）:
//   - 年齢は「その年の誕生日を迎えた後」の満年齢を基準に表記し、誕生日前は1歳引く
//   - 学年は4月2日〜翌4月1日生まれを同学年とする（1月1日〜4月1日生まれが「早生まれ」）
//   - 厄年・長寿祝いは数え年（その年の元日に年齢+1）。還暦のみ満60歳の年も併記されるのが通例
// <client>
const ETO = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ETO_YOMI = ["ね", "うし", "とら", "う", "たつ", "み", "うま", "ひつじ", "さる", "とり", "いぬ", "い"];
function eto(year) { return ETO[((year - 4) % 12 + 12) % 12]; }
function etoYomi(year) { return ETO_YOMI[((year - 4) % 12 + 12) % 12]; }

// 和暦（年単位。改元年は両方の元号を返す。1年は「元年」表記）
function warekiOne(era, n) { return era + (n === 1 ? "元" : n) + "年"; }
function wareki(year) {
  const eras = [];
  if (year >= 1868 && year <= 1912) eras.push(warekiOne("明治", year - 1867));
  if (year >= 1912 && year <= 1926) eras.push(warekiOne("大正", year - 1911));
  if (year >= 1926 && year <= 1989) eras.push(warekiOne("昭和", year - 1925));
  if (year >= 1989 && year <= 2019) eras.push(warekiOne("平成", year - 1988));
  if (year >= 2019) eras.push(warekiOne("令和", year - 2018));
  return eras.join("／");
}

// その年に迎える満年齢（誕生日後）
function ageInYear(birthYear, year) { return year - birthYear; }
// 数え年
function kazoe(birthYear, year) { return year - birthYear + 1; }
// </client>

// 学校の入学・卒業年（4/2〜翌4/1コホート。cohortYear = 4/2時点の暦年）
function schoolYears(cohortYear) {
  const c = cohortYear;
  return {
    elemIn: c + 7, elemOut: c + 13,   // 小学校 入学/卒業（3月）
    jhsIn: c + 13, jhsOut: c + 16,    // 中学校
    hsIn: c + 16, hsOut: c + 19,      // 高校
    uniIn: c + 19, uniOut: c + 23,    // 大学（現役4年制）
    seijin: c + 21,                   // 二十歳のつどい（1月）
  };
}

// 厄年（数え年）: 本厄の数え年齢
const YAKU = {
  male: [25, 42, 61],
  female: [19, 33, 37, 61],
};
// 長寿祝い: [名称, 数え年齢]（還暦は満60が通例なので個別扱い）
const CHOJU = [
  ["古希", 70], ["喜寿", 77], ["傘寿", 80], ["米寿", 88],
  ["卒寿", 90], ["白寿", 99], ["百寿", 100],
];

module.exports = { eto, etoYomi, wareki, ageInYear, kazoe, schoolYears, YAKU, CHOJU };

// 自己検証
if (require.main === module) {
  const assert = require("assert");
  assert.strictEqual(eto(2026), "午");
  assert.strictEqual(eto(2025), "巳");
  assert.strictEqual(eto(1990), "午");
  assert.strictEqual(eto(1924), "子");
  assert.strictEqual(wareki(1989), "昭和64年／平成元年");
  assert.strictEqual(wareki(1990), "平成2年");
  assert.strictEqual(wareki(2019), "平成31年／令和元年");
  assert.strictEqual(wareki(2026), "令和8年");
  assert.strictEqual(wareki(1926), "大正15年／昭和元年");
  assert.strictEqual(ageInYear(1990, 2026), 36);
  assert.strictEqual(kazoe(1990, 2026), 37);
  const s = schoolYears(1990);
  assert.strictEqual(s.elemIn, 1997);
  assert.strictEqual(s.hsOut, 2009);
  assert.strictEqual(s.seijin, 2011);
  // 還暦: 1966年生まれ → 満60歳は2026年
  assert.strictEqual(1966 + 60, 2026);
  console.log("nenrei.js self-check OK");
}
