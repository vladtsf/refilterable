export default function createLocationObserver(initialQueryString: string = '') {
  let subscribers: { [param: string]: Function[] } = {};
  let params = new URLSearchParams(initialQueryString);

  function watch(param: string, callback: Function): Function {
    if (!subscribers[param]) subscribers[param] = [];

    subscribers[param].push(callback);

    return () => {
      subscribers[param] = subscribers[param].filter(s => s !== callback);

      if (subscribers[param].length === 0) delete subscribers[param];
    }
  }

  function getParamInfo(paramName: string) {
    return {
      hasParam: params.has(paramName),
      paramValue: params.get(paramName),
    };
  }

  function getCurrentParams() {
    return new URLSearchParams(params);
  }

  function notify(queryString: string) {
    const prevParams = params;
    params = new URLSearchParams(queryString);

    Object
      .keys(subscribers)
      .forEach((paramName: string) => {
        if(prevParams.get(paramName) !== params.get(paramName)) {
          const paramInfo = getParamInfo(paramName);
          subscribers[paramName].forEach(subscriber => subscriber(paramInfo));
        }
      });
  }

  return { watch, notify, getParamInfo, getCurrentParams };
}