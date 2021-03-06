import { useMemo } from 'react';
import CryptoJS from 'crypto-js';
import lodash from 'lodash';

export function useGravatar(email, size = 256, d = 'robohash') {
  const gravatar = useMemo(() => {
    const trimmedEmail = lodash.trim(email);
    const lowercaseEmail = trimmedEmail.toLowerCase();
    const hash = CryptoJS.MD5(lowercaseEmail).toString();
    const url = `https://www.gravatar.com/avatar/${hash}?d=${d}&s=${size}`;

    return url;
  }, [email, size, d]);

  return gravatar;
};
