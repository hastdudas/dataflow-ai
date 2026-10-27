# Shuketter

PDF・画像・CSV をアップロードするだけで、文字を抽出し、表を整えて返す SaaS。

> **移行について**
> 本リポジトリは GitHub Pages 上の静的サイト（旧ブランド名 "DataFlow AI"）から
> Next.js アプリケーションへ移行しました。旧 URL（`/terms.html` など）は
> `next.config.ts` の 308 リダイレクトで新パスへ転送されます。
> `CNAME` は GitHub Pages 用のファイルです。Vercel へ移行後は不要ですが、
> Pages を併用する間は残しています。

- 本番URL: https://shuketter.com
- 料金: 無料プラン 月3回 / Pro プラン 月額 980円（税込）月50回

---

## 目次

1. [技術構成](#技術構成)
2. [初回セットアップ](#初回セットアップ)
3. [Supabase の設定](#supabase-の設定)
4. [Stripe の設定](#stripe-の設定)
5. [Vercel へのデプロイ](#vercel-へのデプロイ)
6. [環境変数一覧](#環境変数一覧)
7. [ディレクトリ構成](#ディレクトリ構成)
8. [仕様メモ](#仕様メモ)
9. [セキュリティ方針](#セキュリティ方針)
10. [既知の制限](#既知の制限)

---

## 技術構成

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 15（App Router）/ TypeScript |
| スタイル | Tailwind CSS v3 |
| 認証 | Supabase Auth（メールのマジックリンク） |
| データベース | Supabase Postgres（RLS 有効） |
| 決済 | Stripe Checkout / Customer Portal / Webhook |
| PDF | `pdf-parse` |
| OCR | `tesseract.js`（日本語 + 英語） |
| CSV | `papaparse` |
| ホスティング | Vercel |

Web フォントは使用せず OS のシステムフォントで組んでいます（ビルド時の外部通信が不要）。

---

## 初回セットアップ

Node.js 20 以上が必要です。

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数ファイルを作成
cp .env.example .env.local
#    → 下記「環境変数一覧」を参照して値を埋める

# 3. Supabase のテーブルを作成
#    supabase/schema.sql の中身を Supabase の SQL Editor に貼って実行

# 4. 開発サーバーを起動
npm run dev
# http://localhost:3000
```

検証コマンド:

```bash
npm run lint       # ESLint（next/core-web-vitals）
npm run typecheck  # tsc --noEmit
npm run build      # 本番ビルド
```

> `npm run build` は `.env.local` が無くても通ります。環境変数は
> ビルド時ではなくリクエスト時に読み込む実装になっているためです。

この3コマンドは `.github/workflows/ci.yml` により、push と Pull Request のたびに
GitHub Actions 上でも自動実行されます。

---

## Supabase の設定

1. [supabase.com](https://supabase.com) でプロジェクトを作成する。
2. **SQL Editor** を開き、`supabase/schema.sql` の内容を貼り付けて実行する。
   - `profiles` / `usage_logs` テーブル
   - RLS ポリシー（本人のみ読み取り可）
   - `auth.users` への INSERT トリガー（プロフィール自動作成）
3. **Project Settings → API** から次の3つを控え、`.env.local` に設定する。
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`（**サーバー専用**）
4. **Authentication → URL Configuration** を設定する。
   - Site URL: `https://shuketter.com`（開発時は `http://localhost:3000`）
   - Redirect URLs に以下を追加:
     - `http://localhost:3000/auth/callback`
     - `https://shuketter.com/auth/callback`
5. **Authentication → Providers → Email** で Email を有効にする。
   パスワードは使わないため、"Confirm email" は有効のままで構いません。
6. （任意）**Authentication → Email Templates** の Magic Link 本文を日本語に差し替える。

---

## Stripe の設定

### 1. 商品と価格を作る

**Product catalog → 商品を追加**

| 項目 | 値 |
| --- | --- |
| 商品名 | Shuketter Pro |
| 料金体系 | 継続（月次） |
| 金額 | 980 JPY |
| 税の扱い | 税込（内税）に設定 |

作成された **Price ID**（`price_...`）を `STRIPE_PRICE_ID` に設定します。

### 2. APIキー

**開発者 → APIキー** のシークレットキー（`sk_test_...` / `sk_live_...`）を
`STRIPE_SECRET_KEY` に設定します。

### 3. Customer Portal を有効化

**設定 → 請求 → カスタマーポータル** で、以下を有効にしておきます。

- サブスクリプションのキャンセル（解約導線として使用）
- 支払い方法の更新
- 請求書 / 領収書の閲覧

### 4. Webhook

**開発者 → Webhook → エンドポイントを追加**

- URL: `https://shuketter.com/api/stripe/webhook`
- 送信するイベント:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

表示された署名シークレット（`whsec_...`）を `STRIPE_WEBHOOK_SECRET` に設定します。
署名は `stripe.webhooks.constructEvent` で必ず検証しており、
不正な署名のリクエストは 400 で拒否します。

### 5. ローカルでの Webhook 検証

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# 表示される whsec_... を .env.local の STRIPE_WEBHOOK_SECRET に設定

# 別ターミナルで疎通確認
stripe trigger checkout.session.completed
```

テストカード: `4242 4242 4242 4242` / 任意の将来日付 / 任意のCVC。

---

## Vercel へのデプロイ

1. このリポジトリを GitHub に push する。

   ```bash
   git init
   git add .
   git commit -m "feat: Shuketter を Next.js + Supabase + Stripe で構築"
   git branch -M main
   git remote add origin git@github.com:<user>/<repo>.git
   git push -u origin main
   ```

   `.env.local` は `.gitignore` 済みです。**秘密鍵は絶対にコミットしないでください。**

2. Vercel で **Add New → Project** から当該リポジトリを import する。
   Framework Preset は Next.js が自動判定されます。

3. **Settings → Environment Variables** に `.env.example` の項目をすべて登録する。
   `NEXT_PUBLIC_SITE_URL` は `https://shuketter.com` にします。

4. **Settings → Domains** で `shuketter.com` と `www.shuketter.com` を追加し、
   DNS を Vercel の指示どおりに設定する（`www` は apex へリダイレクト推奨）。

5. デプロイ後、Stripe の Webhook URL を本番ドメインに向け直し、
   Supabase の Redirect URLs に本番の `/auth/callback` が入っているか確認する。

---

## 環境変数一覧

`.env.example` と同じ内容です。**太字は必須**。

| 変数名 | 用途 | 公開範囲 |
| --- | --- | --- |
| **`NEXT_PUBLIC_SITE_URL`** | 正規URL。SEO メタデータ、Stripe のリダイレクト先、マジックリンクの戻り先に使用 | ブラウザに露出 |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | 1ファイルの上限MB（既定 `10`） | ブラウザに露出 |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Supabase プロジェクトURL | ブラウザに露出 |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Supabase 匿名キー | ブラウザに露出 |
| **`SUPABASE_SERVICE_ROLE_KEY`** | RLS を越える管理操作（利用回数の記録、Webhook からのプラン更新） | **サーバー専用** |
| **`STRIPE_SECRET_KEY`** | Stripe API キー | **サーバー専用** |
| **`STRIPE_PRICE_ID`** | 月額980円の Price ID | **サーバー専用** |
| **`STRIPE_WEBHOOK_SECRET`** | Webhook 署名検証用シークレット | **サーバー専用** |
| `FREE_MONTHLY_LIMIT` | 無料プランの月間回数（既定 `3`） | サーバー専用 |
| `PRO_MONTHLY_LIMIT` | Pro プランの月間回数（既定 `50`） | サーバー専用 |

`NEXT_PUBLIC_` が付いた変数はブラウザのバンドルに埋め込まれます。
秘密情報には絶対に `NEXT_PUBLIC_` を付けないでください。

---

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                    トップページ（ブランド / 料金 / FAQ）
│   ├── layout.tsx                  共通レイアウト・SEO メタデータ
│   ├── sitemap.ts / robots.ts      サイトマップと robots
│   ├── login/                      ログイン（マジックリンク）
│   ├── auth/callback/              マジックリンクのコールバック
│   ├── company/ terms/ privacy/ tokushoho/ faq/
│   ├── dashboard/
│   │   ├── page.tsx                アップロード + 残り回数 + 最近の履歴
│   │   ├── history/                処理履歴
│   │   └── account/                プラン・お支払い・解約
│   └── api/
│       ├── process/                アップロード処理の本体
│       ├── auth/signout/
│       └── stripe/{checkout,portal,webhook}/
├── components/                     UI コンポーネント
├── lib/
│   ├── supabase/{client,server,admin,middleware}.ts
│   ├── processors/{csv,pdf,ocr}.ts 処理エンジン
│   ├── account.ts                  プラン判定と利用回数の集計
│   ├── stripe.ts / env.ts / log.ts / site.ts / format.ts
├── middleware.ts                   セッション更新と /dashboard の保護
supabase/schema.sql                 テーブル・RLS・トリガー
```

会社名や住所などは `src/lib/site.ts` の `SITE.company` に集約しています。
`（代表者名）` などのプレースホルダを実際の値に置き換えてください。
特定商取引法に基づく表記は、実在の情報で記載する必要があります。

---

## 仕様メモ

### 処理の内訳

| 拡張子 | 処理 | 出力 |
| --- | --- | --- |
| `.csv` | 重複行の削除 / 前後の空白・空行・空列の削除 / 列名の統一（NFKC 正規化・小文字化・区切りを `_` に統一・重複列名の連番付与） | UTF-8 BOM 付き CSV |
| `.pdf` | 埋め込みテキストの抽出 | テキストファイル |
| `.png` `.jpg` `.jpeg` | OCR（日本語 + 英語） | テキストファイル |

### 利用回数

- 暦月（毎月1日 UTC 起算）で集計します。
- 数えるのは **成功した処理だけ**です。失敗は履歴に残りますが回数を消費しません。
- 上限に達すると `/api/process` が 402 を返し、UI がアップグレードを案内します。

### 認証フロー

パスワードは扱いません。メールアドレスに送られたリンクを開くと
`/auth/callback` でコードがセッションに交換され、`/dashboard` へ遷移します。
未ログインで `/dashboard` 配下にアクセスした場合は `middleware.ts` が
`/login?next=...` へリダイレクトします。

---

## セキュリティ方針

- **秘密鍵をリポジトリに置かない。** `.env*` は `.gitignore` 済みで、
  コミットしてよいのは `.env.example`（ダミー値のみ）だけです。
  誤ってコミットした場合は、履歴から除去したうえで鍵をローテートしてください。
- **Webhook の署名検証。** `stripe.webhooks.constructEvent` で検証し、
  署名が無い / 一致しないリクエストは 400 で拒否します。
  この経路だけは middleware の対象外にして、生のリクエストボディを保持しています。
- **アップロードは 10MB まで。** クライアント側とサーバー側の両方で検査し、
  超過時は 413 を返します。拡張子も許可リストで照合します。
- **ログに個人情報を書かない。** `src/lib/log.ts` を経由して JSON 1行で出力し、
  メールアドレス・ファイル名・ファイルの中身は記録しません。
  ユーザーの識別には SHA-256 の先頭10文字を使います。
- **ファイルの中身を保存しない。** 処理はメモリ上で完結し、結果はレスポンスで返すだけです。
  DB に残すのはファイル名・容量・処理種別・結果の要約のみです。
- **RLS。** `profiles` と `usage_logs` は本人のみ読み取り可。書き込みは
  サービスロールキーを持つサーバー側コードからのみ行います。
- **サービスロールキーはサーバー限定。** `src/lib/supabase/admin.ts` は
  Client Component から import しないでください。

---

## 既知の制限

**10MB の上限について**
Vercel のサーバーレス関数はリクエストボディを約 4.5MB に制限しています。
`NEXT_PUBLIC_MAX_UPLOAD_MB=10` のままでも、Vercel 上では 4.5MB 超のファイルが
プラットフォーム側で弾かれます。10MB を実際に通したい場合は、次のいずれかが必要です。

- Supabase Storage への署名付き直接アップロードに変更し、サーバーは URL だけ受け取る
- Vercel の上限が緩いプラン / 別のホスティング（Fly.io、Cloud Run など）を使う

暫定的には `NEXT_PUBLIC_MAX_UPLOAD_MB=4` にしておくと、UI 上の案内と実挙動が一致します。

**OCR の初回実行**
`tesseract.js` は初回実行時に日本語の学習データを CDN から取得します。
コールドスタート時は数十秒かかることがあります。頻度が高い場合は、
学習データを同梱するか、OCR を別のワーカー（キュー）に切り出す構成を検討してください。
`src/app/api/process/route.ts` の `maxDuration` は 60 秒に設定しています。

**スキャンPDF**
文字情報を持たないPDFはテキスト抽出できません。現状は「画像として書き出して
OCR にかけてください」と案内する実装です。PDF → 画像のラスタライズを
サーバー側で行う場合は `pdfjs-dist` などの追加が必要です。

**利用回数のリセット周期**
Stripe の請求期間ではなく暦月でリセットしています。請求期間に合わせる場合は
`src/lib/account.ts` の `periodStart()` を `profiles.current_period_end` 起算に変更してください。
