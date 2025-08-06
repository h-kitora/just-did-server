# just-did-server

本リポジトリは、習慣化支援アプリ「JUST DID」のためのバックエンドAPIサーバです。  
Spotify Web APIと連携し、タスクに応じた音楽推薦や、Spotify認証トークン管理を提供します。

---

## 🎯 主な機能

- 未ログインユーザー向けのプレビュー用楽曲推薦（30秒試聴可能）
- Spotify認証済みユーザー向けのフル楽曲推薦
- Spotify認証（Authorization Code Flow）とトークン管理（リフレッシュ対応）
- Client Credentials Flow によるトークン発行

---

## 📁 ディレクトリ構成

```
just-did-server/
├── index.js            # サーバエントリーポイント
├── .env                # 認証情報（SPOTIFY_CLIENT_ID等）を記載
├── package.json        # 依存パッケージ
├── routes/
│   ├── auth.js         # Spotify認証・トークン取得・リフレッシュ
│   ├── preview.js      # 未ログイン向け楽曲推薦API
│   └── full.js         # ログイン済み向け楽曲推薦API
```

---

## 🌐 起動方法(※開発用)

### 1. 環境変数の設定

`.env` ファイルをルートに配置してください：

```
SPOTIFY_CLIENT_ID=（SpotifyアプリのクライアントID）
SPOTIFY_CLIENT_SECRET=（Spotifyアプリのシークレット）
FRONTEND_URI=https://todo-app-b4af8.web.app
REDIRECT_URI=https://your-backend.onrender.com/auth/callback
```

### 2. ローカル実行

```bash
npm install
npm run dev     # nodemonで自動リロード付き起動（開発用）
# または
npm start       # nodeで通常起動
```

ポートは `.env` 未指定時は `5000` になります。

---

## 🔗 API エンドポイント

### `/auth/token`  
Client Credentials Flow によるアクセストークン取得（サーバ間通信用）

### `/auth/login`  
Spotifyログイン認証画面へリダイレクト

### `/auth/callback`  
Spotifyからの認証コールバックを受け取り、アクセストークン・リフレッシュトークンを返却

### `/auth/refresh_token?refresh_token=xxx`  
リフレッシュトークンを使ってアクセストークンを更新

---

### `/api/preview?task=勉強`

- 認証不要
- `task`（例：運動、お風呂など）に応じたプレイリストから1曲推薦（試聴用）

レスポンス例：
```json
{
  "title": "Rain Sounds",
  "artist": "Calm Rain",
  "url": "https://open.spotify.com/track/xxxxxxxx",
  "imageUrl": "https://i.scdn.co/image/xxx",
  "previewUrl": "https://p.scdn.co/mp3-preview/xxx"
}
```

---

### `/api/full?task=運動&access_token=xxxxx`

- Spotify認証済みユーザー専用
- `access_token` は `/auth/token` または `/auth/callback` で取得
- フル音楽推薦（プレイリスト → 楽曲 → フル再生URL）

レスポンス例：
```json
{
  "title": "Eye of the Tiger",
  "artist": "Survivor",
  "url": "https://open.spotify.com/track/xxx",
  "imageUrl": "https://i.scdn.co/image/xxx",
  "trackId": "xxx"
}
```

---

## 🧪 CORS 設定（index.js）

許可ドメイン：
- `http://localhost:5173`
- `https://todo-app-b4af8.web.app`

---

## 📦 使用技術

| 項目        | 内容                             |
|-------------|----------------------------------|
| 実行環境    | Node.js + Express                |
| 外部API     | Spotify Web API                  |
| 認証方式    | Client Credentials / Auth Code   |
| トークン    | リフレッシュ対応、Base64認証    |
| デプロイ先  | Render（予定）                   |

---

## 📌 注意事項

- `.env` ファイルは Git 管理対象に含めないでください。
- Spotify API 利用時は、[Spotify for Developers](https://developer.spotify.com/dashboard/) にてクライアントアプリ登録が必要です。
- 本システムは学習目的のアプリに限って使用されます。

---

## 🔗 関連リポジトリ

👉 [ToDo-app（JUST DID フロントエンド）](https://github.com/h-kitora/ToDo-app)
