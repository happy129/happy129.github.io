import Vue from 'vue';
import specialKeys from 'vue-decorators/src/special.keys';
export * from 'vue-decorators';


function makeWatchDecorator(options = {}) {
  return function (target, key) {
    if (!target[specialKeys.USED_PROPS]) {
      target[specialKeys.USED_PROPS] = {};
    }

    if (!target[specialKeys.WATCHERS]) {
      target[specialKeys.WATCHERS] = {};
    }
    target[specialKeys.WATCHERS][`$watchextra` + Object.keys(target[specialKeys.WATCHERS]).length] = {
      immediate: true, handler() { 
        this.$once('hook:created', () => {
          this.$watch(options.key || key, target[key], options);
        });
      }
    }
  }
}
export function WatchExtra(options, key, descriptor) {
  if (options instanceof Vue) {
    return makeWatchDecorator()(options, key);
  }

  if (key && typeof key == 'object') {
    [key, options] = [options, key];
    if (key) options.key = key;
  }
  return makeWatchDecorator(options);
}