'use strict';

import env from "../env";
import { OidcSession, OidcIdp, discovery } from "./oidc";

/**
 * Cognito User Pool
 */
class CognitoIdp extends OidcIdp {

  constructor(conf) {
    super(conf);
  }

  /**
   * @override
   */
  async signOut(token) {
    let url = new URL(this.config.end_session_endpoint);
    url.searchParams.append('client_id', env.AUTH_CLIENT_ID);
    url.searchParams.append('logout_uri', env.BASE_URL);
    location.href = url;
  }
}


/**
 * OIDCセッションインスタンスを生成します
 * @param {import("../bootstrap").SessionConf} conf
 */
export default async (conf)=>{
  console.log('[session] create session instance', env, conf);
  let oidcConfig = await discovery(env.AUTH_OIDC_DISCOVERY_URL);
  return new OidcSession(new CognitoIdp(oidcConfig), conf);
};