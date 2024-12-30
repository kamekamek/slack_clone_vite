# トラブルシューティング記録

## 発生した問題

1. ESモジュールの警告
2. リソースのブロック（ERR_BLOCKED_BY_CLIENT）
3. 依存関係の最適化エラー（504 Outdated Optimize Dep）
4. Google Fontsの読み込みエラー
5. MessageListコンポーネントでのundefinedエラー
6. 認証の永続的ローディング状態

## 問題の原因

### 1. ESモジュールの警告
- `.js`拡張子のファイルがESモジュールとして扱われていた
- 設定ファイル（`eslint.config.js`、`postcss.config.js`）の拡張子が適切でなかった

### 2. リソースのブロック
- AdBlockerなどのブラウザ拡張機能による誤検知
- `lucide-react`のアイコンファイルがブロックされた
- Content Security Policy（CSP）の設定が不十分

### 3. 依存関係の最適化エラー
- Viteの依存関係最適化設定が不適切
- キャッシュの問題
- `react`と`react-dom`の最適化設定が不足

### 4. Google Fontsの読み込みエラー
- CSPの設定でGoogle Fontsドメインが許可されていなかった

### 5. MessageListコンポーネントでのundefinedエラー
- メッセージの編集履歴（editHistory）が初期化されていない状態でアクセスされた
- オプショナルチェイニングの欠如
- 型安全性の不足

### 6. 認証の永続的ローディング状態
- `useAuth`フックの初期化時に`isLoading`が`true`に設定されたまま
- ローカルストレージからの読み込み完了後も`isLoading`が更新されない
- 各認証操作（ログイン、登録など）でのローディング状態の管理が不適切
- エラー発生時のローディング状態のリセットが行われていない

## 対処方法

### 1. ESモジュールの対応
```typescript
// package.jsonに追加
{
  "type": "module"
}

// 設定ファイルの拡張子を変更
eslint.config.js → eslint.config.mjs
postcss.config.js → postcss.config.mjs
```

### 2. CSPの設定更新
```typescript
// vite.config.tsでCSPヘッダーを設定
{
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https: https://fonts.gstatic.com; connect-src 'self' https:;"
    }
  }
}
```

### 3. 依存関係の最適化設定
```typescript
// vite.config.tsで依存関係の最適化を設定
{
  optimizeDeps: {
    include: ['lucide-react', 'react', 'react-dom']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
}
```

### 4. キャッシュのクリア
```bash
# 依存関係とキャッシュをクリア
rm -rf node_modules/.vite
rm -rf node_modules
npm install
```

### 5. MessageListコンポーネントの修正
```typescript
// オプショナルチェイニングを使用して安全にアクセス
{message.editHistory?.length > 0 && (
  // 編集履歴の表示ロジック
)}

// 型の定義を明確化
interface Message {
  editHistory?: Array<{
    text: string;
    timestamp: Date;
  }>;
  // その他のプロパティ
}
```

### 6. 認証ローディング状態の修正
```typescript
// useAuth.tsの初期化処理の修正
const [authState, setAuthState] = useState<AuthState>(() => {
  const savedAuth = localStorage.getItem('slack-clone-auth');
  if (savedAuth) {
    const parsed = JSON.parse(savedAuth);
    return { ...parsed, isLoading: false };
  }
  return { user: null, isAuthenticated: false, isLoading: false };
});

// 各認証操作でのローディング状態の管理
const login = async (email: string, password: string) => {
  setAuthState(prev => ({ ...prev, isLoading: true }));
  try {
    // 認証処理
    setAuthState({ user: mockUser, isAuthenticated: true, isLoading: false });
  } catch (error) {
    setAuthState(prev => ({ ...prev, isLoading: false }));
    throw error;
  }
};

// LocalStorage保存時のローディング状態チェック
useEffect(() => {
  if (!authState.isLoading) {
    localStorage.setItem('slack-clone-auth', JSON.stringify(authState));
  }
}, [authState]);
```

## 予防策

1. **設定ファイルの命名規則**
   - ESモジュールを使用する場合は`.mjs`拡張子を使用
   - CommonJSを使用する場合は`.cjs`拡張子を使用

2. **CSPの適切な設定**
   - 必要な外部リソースのドメインを明示的に許可
   - セキュリティとの適切なバランスを考慮

3. **依存関係の管理**
   - 使用する主要なライブラリは`optimizeDeps.include`に追加
   - 定期的なキャッシュクリアとクリーンインストール

4. **開発環境のセットアップ**
   - ブラウザ拡張機能の影響を考慮
   - 開発時は必要に応じてAdBlockerを一時的に無効化 

5. **型安全性の確保**
   - TypeScriptの厳格モードを有効化
   - オプショナルプロパティの適切な型定義
   - nullチェックとオプショナルチェイニングの活用
   - コンポーネントのprops型の明確な定義 

6. **状態管理の原則**
   - 初期状態の適切な設定
   - 非同期操作前後での状態更新の確実な実行
   - エラーハンドリング時の状態リセット
   - 副作用（useEffect）での条件チェック
   - ローディング状態の適切な管理と表示 