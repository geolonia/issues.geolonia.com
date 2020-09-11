# @geolonia/ops

Geolonia 全体に関する issue や、特定のリポジトリに当てはめにくい issue を管理するためのリポジトリです。

## ダッシュボード

Geolonia の Issue は、github.com から確認する以外にも以下の web アプリでも確認することができます。

https://issues.geolonia.com

### 開発環境のセットアップ

0. リポジトリのクローンとインストール

   ```shell
   $ git clone git@github.com:geolonia/ops.git
   $ cd ops
   $ yarn
   ```

1. https://github.com/settings/developers にアクセスして開発用の GitHub OAuth Apps を作成。この時コールバック URL は `http://localhost:3000/login/callback` を指定する
2. Client ID と Client Secret を確認して .env ファイル経由で環境変数を設定

   ```shell
   $ cp .env.sample .env
   $ vi .env
   ```

3. GitHub での OAuth を提供するバックエンドを起動

   ```shell
   $ npm run start:lambda
   ```

4. React 開発サーバーを起動

   ```shell
   $ npm start
   ```
