

/**
 * 错误处理程序
 * @param {object} oldErrorCodes 重载前的错误数据
 * @returns {function} Runtimes
 */
const errorCodesFunction = (
    (oldErrorCodes = null) => {
        // let errorCode = 0x00000;
        // let errorMsg = "";
        let errors = {};

        const ERROR_TYPES = {
            SILENT: 0x0,// 静默
            WARN: 0x1,// 警告
            ERROR: 0x2,// 错误
            FATAL: 0x3,// 致命错误
        };

        const DATA_TYPE = {
            STAORAGE: 'refresh',
        };

        const ERROR_CODE_MSG_ZH_CN = {
            errorCodeNotNumber: "错误码必须是数字类型",
            errorMsgNotString: "错误信息必须是字符串类型",
            errorTypeNotValid: "错误类型不合法",

        };

        const ERROR_CODE_MSG = ERROR_CODE_MSG_ZH_CN;

        if (sessionStorage.getItem(DATA_TYPE.STAORAGE)) { oldErrorCodes = sessionStorage.getItem(DATA_TYPE.STAORAGE); }
        // 参数校验函数
        const validateParams = (code, message, warn) => {
            if (typeof code !== 'number') {
                throw new TypeError(ERROR_CODE_MSG.errorCodeNotNumber);
            }
            // if (typeof message !== 'string') {
            //     throw new TypeError(ERROR_CODE_MSG.errorMsgNotString);
            // }
            if (!Object.values(ERROR_TYPES).includes(warn)) {
                throw new RangeError(ERROR_CODE_MSG.errorTypeNotValid);
            }
        };

        // 显示 Snackbar 的封装（可替换 UI 库）
        const showToast = (message) => {
            try {
                Snackbar.show({
                    text: message,
                    pos: 'top-right',
                    action: 4000,
                });
            } catch (e) {
                console.error('Snackbar 显示失败:', e);
            }
        };

        // 格式化错误码（补零处理）
        const formatErrorCode = (code) => {
            return '0x' + code.toString(16).toUpperCase().padStart(5, '0');
        };

        // 初始化
        if (oldErrorCodes) {
            oldErrorCodes = sessionStorage.getItem(DATA_TYPE.STAORAGE)
        } if (oldErrorCodes) {
            errors = oldErrorCodes;
        } else { }

        return {
            /**
             * 记录一个新的错误码和信息
             * @param {number} code 错误码
             * @param {any} message 错误信息
             * @param {number} warn 【0x0=静默，0x1=警告，0x2=错误，0x3=致命错误】实际应使用 {@link errorMangers.ERROR_TYPES} 常量,注：0x3 时会引发页面重载。
             * @param {boolean} returnID 是否返回错误ID，缺省值为 false
             * @returns {(false | string)} 返回 {@linkcode false}，若 {@link returnID} 为true,则返回错误ID
             * @example } catch (message) {return errorCodes.addError(code, message, errorCodes.ERROR_TYPES.ERROR, false);} // 返回 false，减少了单独的返回语句（反正它也不需要处理这个函数的错误）
             * @function {@link errorMangers.getErrorCode} 获取错误码和信息
             * @function {@link errorMangers.clearError} 清除错误信息
             */
            addError: (code = 0x00000, message = "未知错误", warn = ERROR_TYPES.WARN, returnID = false) => {
                try {
                    let errorID;
                    if (crypto) {// 通过合适的算法生成随机ID
                        try {
                            errorID = crypto.randomUUID();
                        } catch (error) {
                            getErrorIDtoMD5String();
                        }
                    } else {
                        getErrorIDtoMD5String();
                    }

                    validateParams(code, message, warn);

                    errors[errorID] = {
                        code: code,
                        message: message,
                        warn: warn,
                        time: new Date().toLocaleString(),
                    };

                    const fullMessage = `运行时出错: (${formatErrorCode(code)})`;

                    console.error(fullMessage, message); // 抛出错误
                    debugger; // 尝试暂停程序

                    switch (warn) {
                        case ERROR_TYPES.WARN:
                            showToast(fullMessage);
                            break;
                        case ERROR_TYPES.ERROR:
                            showToast(fullMessage);
                            break;
                        case ERROR_TYPES.FATAL:
                            sessionStorage.setItem(DATA_TYPE.STAORAGE, JSON.stringify({
                                error: errors,
                            }));
                            window.location.reload(); // 重载界面
                            break;
                        default:
                            break;
                    };

                    if (returnID) return errorID;
                } catch (e) {
                    console.error('错误处理失败:', e);
                }
                return false;

                function getErrorIDtoMD5String() {
                    errorID = Date.now().toString(36)
                            + Math.random().toString(36).slice(2, 10)
                            + performance.now().toString(36).replace('.', '');
                }
            },

            addError: (errorObject, warn = ERROR_TYPES.WARN, returnID = false) => {

            },

            /**
             * 取得错误码和信息
             * @param {string} id 错误ID
             * @returns {object} 错误码和信息对象
             * @function {@link errorMangers.addError} 设置错误码和信息
             * @function {@link errorMangers.clearError} 清除错误信息
             */
            getErrorCode: (id) => ({
                code: errors[id].code,
                message: errors[id].message,
                time: errors[id].time,
            }),

            /**
             * 通过 错误码 取到错误信息
             * @param {number} errorCode 错误码
             * @returns {object} 错误码和信息对象
             * @function {@link errorMangers.addError} 设置错误码和信息
             * @function {@link errorMangers.clearError} 清除错误信息
             */
            getErrors: (errorCode) => {
                let result = {
                    message: "让我康康有神马错误 (　o=^•ェ•)o　┏━┓",
                    code: 201,
                    items: {},
                    length: 0
                };
                for (let errorID in errors) {
                    if (errors[errorID].code === errorCode) {
                        result.items[errorID] = errors[errorID];
                        result.length++;
                        if (result.code === 201) {
                            result.code = 200;
                        }
                    }
                } if (result.code === 201) {
                    result.message = "啥也木有 (　o=^•ェ•)o　┏━┓";
                    result.code = 201;
                    return result;
                }
                return result;
            },


            /**
             * 返回所有已被记录的错误码和信息
             * @returns {{code: number, message: string, items: {code: number, message: string, warn: number, time: Date}[...], length: number}}
             * @function {@link errorMangers.addError} 设置错误码和信息
             * @function {@link errorMangers.getErrorCode} 取得错误码和信息
             */
            getAllErrorCodes: () => {
                if (errors == {}) {
                    return {
                        items: {},
                        length: 0,
                        message: "啥也木有 (　o=^•ェ•)o　┏━┓",
                        items: {}
                    }   
                } else {
                    return {
                        code: 200,
                        length: Object.keys(errors).length,
                        message: "获取成功 (*≧︶≦))(￣▽￣* )ゞ",
                        items: errors
                    }
                }
            },

            /**
             * 清除错误信息
             * @returns {null}
             * @function {@link errorMangers.addError} 设置错误码和信息
             * @function {@link errorMangers.getErrorCode} 取得错误码和信息
             */
            clearError: () => {
                errors = null;
            },

            // 暴露常量
            ERROR_TYPES: ERROR_TYPES,
            DATA_TYPE: DATA_TYPE,
            errors: errors
        };
    });

const errorManagers = errorCodesFunction(null);

/** 明亮/暗黑模式切换
 * ----------------------------------------------------------------------------
 * - 2024-12-28 解决了首次访问时,没有coockie时导致if执行失败,导致部分图片没有切换.
 * - 2025-02-21 现在没有Cookie时，会根据时间自动切换模式。
 * - 2025-03-04 修复了会导致一直是白天模式bug。
 * - 2025-04-15 修复逻辑问题,统一将Cookies更换为sessionStorage
 * - 2025-04-28 继续优化和修复一些小问题
 * - 2025-05-04 重写了切换逻辑
 * - 2025-07-06 修复了用户自定义切换 JavaScript 代码的代码问题
 * - 2025-07-21 添加了可以跟随系统模式切换的功能
 * - __此代码于 2026-04-24 从 Blog MainJS 复制到此处__
 */
const lightDarkTheme = (() => {
    const DATA_TYPE = {
        LIGHT: "light",
        DARK: "dark",
        AUTO: "auto",
        HTML_KEY: "data-theme",
        STORAGE_KEY: "lightDarkTheme"
    };
    const systemLightMode = window.matchMedia("(prefers-color-scheme: light)");

    let theme = DATA_TYPE.AUTO; // [ light | dark | auto ]

    // 初始化主题
    const initializeTheme = () => {
        const storedTheme = sessionStorage.getItem(DATA_TYPE.STORAGE_KEY);
        if (storedTheme) {
            theme = storedTheme;
            lightDarkTheme.setTheme(storedTheme, false);
        } else {
            theme = DATA_TYPE.AUTO;
            autoTheme(false, false);
        }
    };

    /** 
     * 切换当前页面 明亮/暗黑 主题状态
     * 若为 自动 | 未定义 则适应当前时间自动切换
     * @param {boolean} enableSnackbar 是否显示切换提示，缺省值为 true
     * @param {boolean} setStorage 保存配置?
     */
    const switchTheme = (enableSnackbar = true, setStorage = false) => {
        if (theme === DATA_TYPE.AUTO) {
            autoTheme(enableSnackbar, setStorage);
            // const currentTheme = document.documentElement.getAttribute(DATA_TYPE.HTML_KEY);
            // if (currentTheme === DATA_TYPE.DARK) {
            //     lightTheme(enableSnackbar);
            // } else {
            //     darkTheme(enableSnackbar);
            // }
        } else {
            if (theme === DATA_TYPE.DARK) {
                lightTheme(enableSnackbar, setStorage);
            } else if (theme === DATA_TYPE.LIGHT) {
                darkTheme(enableSnackbar, setStorage);
            } else {
                autoTheme(enableSnackbar, setStorage);
            }
        }
    };

    /**
     * 将当前主题设置为 明亮模式
     * @param {boolean} enableSnackbar 
     */
    const lightTheme = (enableSnackbar = true, setStorage = false) => {
        theme = DATA_TYPE.LIGHT;
        document.documentElement.setAttribute(DATA_TYPE.HTML_KEY, DATA_TYPE.LIGHT);
        if (setStorage)  _setStorageItem(DATA_TYPE.LIGHT); // 存储配置
        if (enableSnackbar) //GLOBAL_CONFIG.Snackbar && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day);
        try {
            _lightUserPug();
        } catch (error) {
            return errorManagers.addError(0x01010, `用户自定义切换 JavaScript 代码出现错误：${error}`, errorManagers.ERROR_TYPES.ERROR)
        }
    };

    /**
     * 将当前主题设置为 暗黑模式
     * @param {boolean} enableSnackbar  是否显示切换提示，缺省值为 true
     * @param {boolean} setStorage 保存配置
     */
    const darkTheme = (enableSnackbar = true, setStorage = false) => {
        theme = DATA_TYPE.DARK;
        document.documentElement.setAttribute(DATA_TYPE.HTML_KEY, DATA_TYPE.DARK);
        if (setStorage) _setStorageItem(DATA_TYPE.DARK);
        if (enableSnackbar) //GLOBAL_CONFIG.Snackbar && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night);
        try {
            _darkUserPug();
        } catch (error) {
            return errorManagers.addError(0x01011, `用户自定义切换 JavaScript 代码出现错误：${error}`, errorManagers.ERROR_TYPES.ERROR)
        }
    };

    /**
     * 自动模式切换
     * @param {boolean} enableSnackbar 是否显示切换提示，缺省值为 true
     * @param {boolean} setStorage 保存配置
     */
    const autoTheme = (enableSnackbar = true, setStorage = false) => {
        let currentHour;
        let darkThemeThreshold;
        if (!systemLightMode) {
            currentHour = new Date().getHours();
            darkThemeThreshold = 18; // 18点之后切换为暗黑模式
        }

        if (systemLightMode || currentHour >= darkThemeThreshold) {
            darkTheme(enableSnackbar, setStorage);
        } else {
            lightTheme(enableSnackbar, setStorage);
        }
    };

    /**
     * 写入本地存储的值
     * @param {string} value 欲存储值
     * @returns {boolean} 是否成功写入
     */
    const _setStorageItem = (value) => {
        try {
            sessionStorage.setItem(DATA_TYPE.STORAGE_KEY, value);
            return true;
        } catch (error) {
            return errorManagers.addError(0x00001, `写入本地存储失败：${error}`, errorManagers.ERROR_TYPES.ERROR);
        }
    };

    return {
        /**
         * 取当前主题
         * @returns {string} 当前主题
         */
        getTheme: () => theme,

        /**
         * 刷新主题设置，其实就是重新读取本地存储的主题设置
         * 保持没有通知
         */
        refreshTheme: () => initializeTheme(),

        /**
         * 设置主题
         * @param {string} newTheme 新的主题
         * @param {boolean} enableSnackbar 是否显示切换提示，缺省值为 true
         * @returns {boolean} 是否成功设置
         */
        setTheme: (newTheme, enableSnackbar = true, setStorage = false) => {
            if (newTheme === DATA_TYPE.LIGHT) {
                lightTheme(enableSnackbar, setStorage);
            } else if (newTheme === DATA_TYPE.DARK) {
                darkTheme(enableSnackbar, setStorage);
            } else if (newTheme === DATA_TYPE.AUTO) {
                autoTheme(enableSnackbar, setStorage);
            } else {
                return errorManagers.addError(0x00002, `无效的主题：${newTheme}`, errorManagers.ERROR_TYPES.ERROR);
            }
            return true;
        },

        /**
         * 手动切换主题
         * @param {boolean} enableSnackbar 是否显示切换提示，缺省值为 true
         */
        toggleTheme: (enableSnackbar = true) => {
            if (!typeof enableSnackbar === "number") enableSnackbar = true;
            switchTheme(enableSnackbar, true);
        },

        // 暴露常量
        DATA_TYPE
    };
})();

/**
* 判断是否是移动端
* @information 本函数使用 UA 解析，若要使用其他方式解析，请使用 {@link isMobileOrNarrow()}
* @return {boolean} true: 移动端 false: PC端
*/
function isUAMobile() {
    return (window.navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ));
}

/**
 * 判断是否是PC端
 * @returns {boolean} true: 是PC端 false: 是移动端
 * @information 本函数使用 UA 解析，若要使用页面宽度判断解析，请使用 {@link isPcOrNotNarrow()}
 */
function isUAPC() { return !isUAMobile(); }

/**
 * 使用当前页面宽度判断是否为移动端或页面过窄
 * @returns {boolean} 是否页面过窄
 * @function {@link isUAMobile()} 使用 UserAgent 解析
 * @function {@link isPcOrNotNarrow} 反式
 */
function isMobileOrNarrow() {
    // 获取当前页面的宽度
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const MAX = 768; // 移动端或页面过窄的最大宽度

    // 判断页面宽度是否小于等于768px
    return windowWidth <= MAX;
}

/**
 * 使用当前页面宽度判断是否为PC端或页面宽度正常
 * @returns {boolean} 是否页面为标准宽度
 * @function {@link isUAPC} 使用 UserAgent 解析
 * @function {@link isMobileOrNarrow} 反式
 */
function isPcOrNotNarrow() { return !isMobileOrNarrow(); }

function fetchSaysData() {
    // return;
    fetch("/api/says.json")
        .then((response) => {
            if (!response.ok) {
                return errorManagers.addError(0x00003, `获取数据失败：${response.status}`, errorManagers.ERROR_TYPES.ERROR);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
            const element = document.querySelector("main");
            for (let i = data.length; i >= 0; i--) {
                let sayItem = data[i - 1];
                if (!sayItem.title) sayItem.title = "";
                if (!sayItem.content) sayItem.content = "";
                if (!sayItem.author) sayItem.author = "???";
                if (!sayItem.time) sayItem.time = "";
                element.innerHTML += retureItem(sayItem.title, sayItem.content, sayItem.author, sayItem.time, i);
            }
        })
        .catch((error) => {
            errorManagers.addError(0x00000, `获取数据失败：${error}`, errorManagers.ERROR_TYPES.ERROR);
        })
}


function retureItem(title, content, author, time, id) {
    let classTime;
    try {
        classTime = new Date(time).toISOString() || "";
    } catch {
        classTime = "";
    }
    return `
    <div class="item" id="item-${id}">
        ${title === "" ? "" : `<div class="item-title">${title}</div><hr />`}
        <div class="item-content">
            <p>${content}</p>
        </div>
        <div class="item-bottom">
            <span class="item-author">
                ——
                <span class="item-author-name">${author}</span>
                <span class="span-null">     </span>
                <datatime datetime="${classTime}">${time}</datatime>
            </span>
        </div>
        <hr />
        
        <div id="item-${id}-comment" class="item-comment"></div>
    </div>`

}

function formatDate(date, format = "yyyy-MM-dd HH:mm:ss") {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const toSymbol = () => {
      return hours > 12 ? "PM" : "AM";
    };
    const hasSymbol = format.indexOf('a') > -1
    const symbols = {
      yyyy: year,
      MM: `${month}`.padStart(2, "0"),
      dd: `${day}`.padStart(2, "0"),
      HH: `${hours}`.padStart(2, "0"),
      hh: hasSymbol && hours > 12 ? hours - 12 : hours,
      mm: `${minutes}`.padStart(2, "0"),
      ss: `${seconds}`.padStart(2, "0"),
      // a 表示12小时制
      a: toSymbol(),
    };
    let time = format;

    Object.keys(symbols).forEach((key) => {
      time = time.replace(key, symbols[key]);
    });

    return time;
}

// 2024-10-26 PM 1:06:43 12 小时制
console.log(formatDate(new Date(), "yyyy-MM-dd a hh:mm:ss"));

// 作者：乘风巨浪
// 链接：https://juejin.cn/post/7429929953225703434
// 来源：稀土掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。