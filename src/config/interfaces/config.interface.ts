export interface JwtConfig {
  secret: string;
  expiresIn: number;
}
export interface Config {
  jwt: JwtConfig;
}
