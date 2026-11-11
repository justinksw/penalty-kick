# penalty-kick plan v1

- Date: 2026-11-11
- Owner window: Sua
- Repo: `justinksw/penalty-kick`（公開 GitHub Pages、Justin 決定）
- Live URL (target): https://justinksw.github.io/penalty-kick/
- Audience: Justin がスマホで遊べる個人用ミニゲーム（公開でも自分優先）
- 別ハブ: momo-jp / koko-hangul とは別リポ・別サイト

## 目的

スマホで遊べる、シンプルなペナルティキック（PK）ミニゲームを GitHub Pages で公開する。片手でも操作できること。v1 は遊べること優先。本フットボールの感じに寄せるが、複雑にしない。

## v1 の範囲

- 1 本のプレイ体験: キック → キーパーの反応 → ゴールまたはセーブ → 得点が分かる → もう一度蹴れる
- 静的サイト。ログイン・サーバ・対戦なし
- モバイル優先（電話で遊べるのが必須。向きの扱いは Celine）
- UI 言語: **日本語**（Justin 決定 2026-11-11）。ボタン・結果・難易度・得点などの文言は日本語
- PK の規約・メカ（ショット、キーパー、合否、採点、難易など）は **Flor が決める**。このメモでは中身を書かない
- ピクセル・色・レイアウトは **Celine**。実装・Pages は **Jessie**

## v1 外

オンライン対戦、アカウント／進捗保存、実在選手の顔・クラブ権利、長いキャリアモード、課金、独自ドメイン。

## 役割・handoff順

1. **Sua** — この設計メモ／窓口／調整（最後まで）
2. **Flor** — PK の規約／メカのみ。UI・コードは触らない
3. **Celine** — モバイル優先の UI／レイアウト（このメモの形 ＋ Flor の規約）。コードは書かない。`design-build-handoff` → Jessie
4. **Jessie** — 実装・GitHub Pages（preview → acceptance → live）。`design-build-handoff` + `pages-preview-live` / `pages-acceptance-proof` / `justinksw-git-author`

渡し方: このメモ → Flor 規約 → 完了後 Celine → 完了後 Jessie。詰まったら Daisy に 1 件。

使わない: Yuumi、Momo、Koko、Beatrice。

## 成功条件

1. 電話で、キックから結果・得点まで 1 本遊べる
2. 再プレイできる
3. https://justinksw.github.io/penalty-kick/ で公開できる静的サイト（preview → Justin OK → live。LIVE は Justin の一声まで HOLD）
4. momo-jp / koko-hangul と混ざらない

## 報告先

すべて Sua。Justin へは Sua がラップ。
