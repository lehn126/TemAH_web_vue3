// 对于axios进行二次封装
import axios from 'axios';
import constants from './constants';

// 底下的代码也是创建axios实例
const requests = axios.create({
  // 基础路径
  baseURL: constants.URL_BASE_URL,
  // 请求不能超过5S
  timeout: 5000,
});

// 请求拦截器（可以在请求发出去之前，做一些事情）
requests.interceptors.request.use(
  // 在发送请求之前做些什么
  (config) => config,
  // 对请求错误做些什么
  // (err) => {
  //   Promise.reject(err);
  // },
);

// 响应拦截器（在数据返回之后，做一些事情）
requests.interceptors.response.use(
  // 对响应数据做点什么
  (res) => res.data,
  // 对响应错误做点什么
  // (err) => {
  //   Promise.reject(err);
  // },
);

function httpGet(url, params) {
  return requests({
    url,
    method: 'get',
    params: params === undefined || params == null ? {} : params,
  });
}

function httpPost(url, data, headers) {
  return requests({
    url,
    method: 'post',
    data: data === undefined || data == null ? '' : data,
    headers: headers === undefined || headers == null ? {} : headers,
  });
}

function notify(notification, props) {
  notification[props.type ? props.type : 'info']({
    content: props.title,
    meta: props.message,
    duration: props.duration ? props.duration : undefined,
  });
}

function notifySuccess(notification, message, title) {
  notify(notification, {
    title: title || '操作成功',
    message: message || '操作执行成功',
    type: 'success',
    duration: 2000,
  });
}

function notifyError(notification, message, title) {
  notify(notification, {
    title: title || '操作失败',
    message: message || '操作失败',
    type: 'error',
    duration: 3000,
  });
}

function notifyWarning(notification, message, title) {
  notify(notification, {
    title: title || '操作失败',
    message: message || '操作失败',
    type: 'warning',
    duration: 3000,
  });
}

function notifyCodeWarning(notification, code, title) {
  notify(notification, {
    title: title || '操作失败',
    message: code ? `操作失败, 错误码: ${code}` : '操作失败',
    type: 'warning',
    duration: 3000,
  });
}

function simpleGet(vm, url, params, successCallback, failedCallback, errorCallback) {
  httpGet(url, params)
    .then((response) => {
      // 处理成功情况
      const code = response.errCode;
      if (code === '0') {
        if (successCallback) {
          successCallback(response);
        }
      } else {
        notifyCodeWarning(vm, code);
        if (failedCallback) {
          failedCallback(response);
        }
      }
    })
    .catch((error) => {
      // 处理错误情况
      notifyError(vm, `操作失败, 错误: ${error.message}`);
      if (errorCallback) {
        errorCallback(error);
      }
    });
}

function simplePost(vm, url, data, headers, successCallback, failedCallback, errorCallback) {
  httpPost(url, data, headers)
    .then((response) => {
      // 处理成功情况
      const code = response.errCode;
      if (code === '0') {
        if (successCallback) {
          successCallback(response);
        }
      } else {
        notifyCodeWarning(vm, code);
        if (failedCallback) {
          failedCallback(response);
        }
      }
    })
    .catch((error) => {
      // 处理错误情况
      notifyError(vm, `操作失败, 错误: ${error.message}`);
      if (errorCallback) {
        errorCallback(error);
      }
    });
}

export default {
  requests,
  httpGet,
  httpPost,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyCodeWarning,
  simpleGet,
  simplePost,
};
