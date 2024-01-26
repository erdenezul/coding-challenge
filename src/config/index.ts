/* istanbul ignore file */

import { Config } from './interfaces/config.interface';

const config: Config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: Number(process.env.JWT_EXPIRES_IN),
  },
};

export default (): Config => config;
