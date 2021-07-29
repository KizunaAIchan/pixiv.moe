import honoka from 'honoka';
import config from '../config';
import Storage from './Storage';

interface IPixivResponse {
  [key: string]: any;
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

honoka.defaults.baseURL = config.apiBaseURL;
honoka.defaults.timeout = 60e3;

export const getAuth = () => {
  return Storage.get('auth');
};

export const setAuth = (authData: any, setAuthFunc?: (data: any) => void) => {
  if (setAuthFunc) {
    setAuthFunc(authData);
  }
  return Storage.set('auth', authData);
};

export const removeAuth = (setAuthFunc?: (data: any) => void) => {
  if (setAuthFunc) {
    setAuthFunc(null);
  }

  return Storage.remove('auth');
};

honoka.interceptors.register({
  request: options => {
    if (getAuth()?.access_token) {
      options.headers['X-Access-Token'] = getAuth()?.access_token;
    }
    if (Storage.get('token')) {
      options.headers['X-Kotori-Token'] = Storage.get('token');
    }
    return options;
  },
  response: response => {
    if (response.data?.code !== 200) {
      return new APIError(response.data?.message);
    }
    return response.data;
  }
});

export const session = () => honoka.get('/session') as Promise<IPixivResponse>;

export const tags = () =>
  honoka.get('/v2/trending/tags') as Promise<IPixivResponse>;

export const ranking = (page: number) =>
  honoka.get('/v2/ranking', {
    data: {
      page
    }
  }) as Promise<IPixivResponse>;

export const search = (data: { word: string; page: number }) =>
  honoka.get('/v2/search', {
    data
  }) as Promise<IPixivResponse>;

export const searchBeta = (data: {
  word: string;
  page: number;
  x_restrict: number;
}) =>
  honoka.get('/v2/search/beta', {
    data
  }) as Promise<IPixivResponse>;

export const illust = (illustId: number | string) =>
  honoka.get(`/v2/illust/${illustId}`) as Promise<IPixivResponse>;

export const illustUgoira = (illustId: number | string) =>
  honoka.get(`/v2/illust/ugoira/${illustId}`) as Promise<IPixivResponse>;

export const illustComments = (
  illustId: number | string,
  data: {
    page: number;
  }
) =>
  honoka.get(`/v2/illust/comments/${illustId}`, {
    data
  }) as Promise<IPixivResponse>;

export const illustBookmarkDetail = (illustId: number | string) =>
  honoka.get(`/v1/illust/bookmark/${illustId}`) as Promise<IPixivResponse>;

export const illustBookmarkAdd = (illustId: number | string) =>
  honoka.post(`/v1/illust/bookmark/${illustId}`) as Promise<IPixivResponse>;

export const illustBookmarkDelete = (illustId: number | string) =>
  honoka.delete(`/v1/illust/bookmark/${illustId}`) as Promise<IPixivResponse>;

export const proxyImage = (url: string) => {
  const regex = /^http?s:\/\/(i\.pximg\.net)|(source\.pixiv\.net)/i;
  if (regex.test(url)) {
    return `${config.apiBaseURL}/image/${url.replace(/^http?s:\/\//, '')}`;
  }
  return url;
};

export const auth = (data: {
  username?: string;
  password?: string;
  refreshToken?: string;
}) =>
  honoka.post('/v1/auth', {
    data: {
      username: data.username,
      password: data.password,
      refresh_token: data.refreshToken
    }
  }) as Promise<IPixivResponse>;

export const refreshToken = () => {
  const authData = getAuth();
  if (authData?.refresh_token) {
    auth({ refreshToken: authData.refresh_token })
      .then(data => {
        setAuth(data.response);
      })
      .catch(err => {
        if (err.message === 'Invalid refresh token') {
          removeAuth();
          location.reload();
        }
      });
  }
};
