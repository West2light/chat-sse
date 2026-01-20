export interface SystemFeatures {
  sso_enforced_for_signin: boolean
  enable_marketplace: boolean
  enable_email_password_login: boolean
  is_allow_register: boolean
  license: {
    status: string
    expired_at: string
  }
}
