import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import _axios from 'axios';

import axios from '../../api/axios';

const AuthNaverCallback = () => {
  const [searchParams] = useSearchParams();
  const [onlyOnce, setOnlyOnce] = useState(true);

  useEffect(() => {
    const fetchLogin = async () => {
      const code = searchParams.get('code');
      try {
        if (!onlyOnce) return;
        if (!code) return;
        const naverRes = await _axios.get(
          `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${
            import.meta.env.VITE_NAVER_CLIENT_ID
          }&client_secret=${import.meta.env.VITE_NAVER_CLIENT_SECRET}&code=${code}&state=${import.meta.env.VITE_NAVER_STATE}`,
        );

        const res = await axios.post(
          '/login/naver',
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              socialAccessToken: naverRes.data.access_token,
            },
          },
        );

        localStorage.setItem('access-token', res.data.data.accessToken);
        localStorage.setItem('refresh-token', res.data.data.refreshToken);

        if (!res.data.data.isOnboarding) {
          window.location.href = '/onboarding';
        } else {
          window.location.href = '/';
        }
        setOnlyOnce(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLogin();
  }, [searchParams]);

  return null;
};

export default AuthNaverCallback;
