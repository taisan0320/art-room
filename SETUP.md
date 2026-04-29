# アートルーム セットアップ手順

## 1. Supabaseの設定

### 1-1. Supabaseプロジェクトを作る
1. https://supabase.com にアクセスしてアカウント作成
2. 「New Project」からプロジェクトを作成

### 1-2. データベースを設定する
1. 左メニューの「SQL Editor」を開く
2. `supabase-schema.sql` の中身をすべてコピーして貼り付け、実行する

### 1-3. APIキーを確認する
1. 左メニューの「Settings」→「API」を開く
2. 以下の2つをメモする：
   - `Project URL`（例：https://xxxx.supabase.co）
   - `anon public` キー

---

## 2. 環境変数の設定

`.env.local` を以下のように編集する：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co  ← Project URLに変更
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...          ← anon keyに変更
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app     ← Vercelのドメインに変更
```

---

## 3. Vercelへデプロイ

1. GitHubにリポジトリを作成してpush
2. https://vercel.com でプロジェクトをimport
3. 「Environment Variables」に `.env.local` の3つの変数を追加
4. デプロイ！

---

## 4. 使い方

### 先生の操作
1. サイトにアクセスして「👩‍🏫 先生はこちら」をクリック
2. 絵をアップロードして「ルームを作る！」
3. ルーム一覧の「表示」をクリック → 大画面に投影
4. QRコードが表示されるので生徒に見せる

### 生徒の操作
1. QRコードをスキャン
2. ニックネームを入力して入室
3. コメントを書いて送信！

---

## ページ構成

| URL | 役割 |
|-----|------|
| `/` | ホーム |
| `/admin` | 先生ダッシュボード（ルーム作成） |
| `/room/[id]` | 大画面表示（絵＋コメント＋QR） |
| `/join/[id]` | 生徒のコメント入力（スマホ） |
