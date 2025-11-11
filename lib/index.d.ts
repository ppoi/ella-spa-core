import { Session } from "./session/types";

/**
 * アプリケーション環境情報
 */
declare type AppEnv = {
  /**
   * The base URI of the application.
   */
  BASE_URI: string;

  /**
   * API endpoint URL.
   */
  API_ENDPOINT?: string;

  /**
   * OIDC構成情報URL
   */
  AUTH_OIDC_DISCOVERY_URL?: string;

  /**
   * OIDC scope
   */
  AUTH_OIDC_SCOPES?: string;

  /**
   * 認証クライアントID
   */
  AUTH_CLIENT_ID?: string;
}

/**
 * セッションモジュール設定
 */
declare type SessionConfig = {
  module: (config: SessionConfig) => Promise<Session>;
  tokenStore: 'local' | 'session';
}

/**
 * spa-coreモジュール設定
 */
declare type CoreConfig = {
  envDef: string | AppEnv;
  sessionDef: SessionConfig;
}

/**
 * SPA設定情報
 */
declare const env: AppEnv;

/**
 * セッション情報
 */
declare const session: Session;

/**
 * spa-coreモジュールを初期化します。
 * @param config spa-coreモジュール設定
 */
declare function bootstrap(config: CoreConfig): Promise<void>;

/**
 * ローディングスクリーンを表示または非表示にします。
 * @param {boolean} show - ローディングスクリーンの表示状態
 */
declare function loading(show: boolean): void