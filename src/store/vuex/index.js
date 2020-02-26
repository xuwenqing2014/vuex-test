let Vue;
const forEach = (obj, cb) => {
    Object.keys(obj).forEach(key => {
        cb(key, obj[key]);
    });
};
class moduleCollection{
    constructor(options) {
        this.register([], options);
    }
    register(path, rootModule) {
        let rawModule = {
            _raw: rootModule,
            state: rootModule.state,
            _children: {}
        };
        if (!this.root) {
            this.root = rawModule;
        } else {
            let parentModule = path.slice(0, -1).reduce((root, current) => {
                return root._children[current];
            }, this.root);
            parentModule._children[path[path.length - 1]] = rawModule;
        }
        if (rootModule.modules) {
            forEach(rootModule.modules, (moduleName, moduleValue) => {
                this.register(path.concat(moduleName), moduleValue)
            });
        }
    }
}
class Store {
    constructor(options) {
        // const { state, getters, mutations, actions } = options;
        this.vm = new Vue({
            data: {
                state: options.state
            }
        });
        this.getters = {};
        // forEach(getters, (key, value) => {
        //     Object.defineProperty(this.getters, key, {
        //         get: () => {
        //             return value(this.state);
        //         }
        //     });
        // });
        this.mutations = {};
        // forEach(mutations, (key, value) => {
        //     this.mutations[key] = (payload) => {
        //         value(this.state, payload);
        //     };
        // });
        this.actions = {};
        // forEach(actions, (key, value) => {
        //     this.actions[key] = (payload) => {
        //         value(this, payload);
        //     };
        // });
        this.modules = new moduleCollection(options);
        installModule(this, this.state, [], this.modules.root);
        console.log(this.state)
    }
    get state() {
        return this.vm.state;
    }
    commit = (mutationName, payload) => {
        // this.mutations[mutationName](payload);
        this.mutations[mutationName].forEach(fn => fn(payload));
    }
    dispatch = (actionName, payload) => {
        // this.actions[actionName](payload);
        this.actions[actionName].forEach(fn => fn(payload));
    }
    registerModule(moduleName, value) {
        if (!Array.isArray(moduleName)) {
            moduleName = [moduleName];
        }
        this.modules.register(moduleName, value);
        installModule(this, this.state, moduleName, new moduleCollection(value).root);
    }
}

const installModule = (store, rootState, path, rawModule) => {
    if (path.length > 0) {
        let parentState = path.slice(0, -1).reduce((rootState, current) => {
            return rootState[current];
        }, rootState);
        Vue.set(parentState, path[path.length - 1], rawModule.state);
    }
    let getters = rawModule._raw.getters;
    if (getters) {
        forEach(getters, (getterName, value) => {
            Object.defineProperty(store.getters, getterName, {
                get: () => {
                    return value(rawModule.state);
                }
            });
        });
    }
    let mutations = rawModule._raw.mutations;
    if (mutations) {
        forEach(mutations, (mutationName, value) => {
            let arr = store.mutations[mutationName] || (store.mutations[mutationName] = []);
            arr.push((payload) => {
                value(rawModule.state, payload);
            });
        });
    }
    let actions = rawModule._raw.actions;
    if (actions) {
        forEach(actions, (actionName, value) => {
            let arr = store.actions[actionName] || (store.actions[actionName] = []);
            arr.push((payload) => {
                value(store, payload);
            });
        });
    }
    forEach(rawModule._children, (moduleName, rawModule) => {
        installModule(store, rootState, path.concat(moduleName), rawModule);
    });
}
const install = (_Vue) => {
    Vue = _Vue;
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                this.$store = this.$options.store
            } else {
                this.$store = this.$parent && this.$parent.$store;
            }
        },
    });
}

export default {
    Store,
    install
};