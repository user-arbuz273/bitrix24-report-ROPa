// класс проверок
export class checker {
    static async init(config) {
        checker.checkBX();
        return await checker.checkUser(config);
    }
    static async checkUser(config) {

        if (BX24.isAdmin()) {
            return true;
        } else {
            return new Promise(async (resolve, reject) => {

                await request.BXcall('user.current', {})
                    .then((response) => {

                        this.userId = response[0].ID;
                        this.data = {
                            type: 'load grand for workers',
                            portal: config.serverPath,
                        };

                        return request.AJAX(this.data, config);
                    })
                    .then((response) => {

                        this.userIds = JSON.parse(response);

                        resolve(this.userIds.includes(this.userId));
                    })
                    .catch((error) => {
                        console.error(error);
                    })
            });
        }
    }
    static checkBX() {

        if (!(BX24.isReady())) {
            BX24.init();
        }

        return true;
    }
}

// класс запросов
export class request {

    static async AJAX(data, config) {

        return await $.ajax({
            type: "POST",
            url: `https://${config.serverHost}/${config.appName}/ajax.php`,
            data: data,
        });
    }
    static async BXcall(method, params = {}){

        let result = [];

        return new Promise(async(resolve, reject) => {
            try {
                await BX24.callMethod(method, params,
                    function (response){

                        if (response.error()){reject(response.error());}

                        result.push(response.data());

                        if (response.more()) {
                            response.next();
                        } else {
                            resolve(result.flat());
                        }
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
    static async BXbatch(batch, params = {}) {

        let result = [], resultIds = [], start = 0, limit = 50;
        let found, inner;

        var formMethod = function(){

            let method = {};
            let index = 1;

            for (let i = start; i <= start + 2450; i+=50){

                const local_params = Object.assign({}, params);

                local_params.start = i;
                local_params.limit = limit;

                method[`get_instance${index}`] = [batch, local_params];
                index++;
            }

            return method;
        }

        async function getBatch(batch, params) {

            return new Promise(async (resolve, reject) => {
                try {
                    await BX24.callBatch(formMethod(),
                        function (response) {

                            console.log(response);

                            start += 2500;

                            if (response.get_instance1.answer.result.fields) inner = (instance) => {return response[instance].answer.result.fields};
                            else if (response.get_instance1.answer.result.types) inner = (instance) => {return response[instance].answer.result.types};
                            else if (response.get_instance1.answer.result.items) inner = (instance) => {return response[instance].answer.result.items};
                            else inner = (instance) => {return response[instance].answer.result};

                            Object.keys(response).forEach((instance) => {

                                if (inner(instance) && inner(instance).length !== 0) {

                                    Object.keys(inner(instance)).forEach(function (key) {

                                        if (!resultIds.includes(inner(instance)[key].id || inner(instance)[key].upperName))
                                        {
                                            resultIds.push(inner(instance)[key].id || inner(instance)[key].upperName);

                                            if (Number(key)) result.push(inner(instance)[key]);
                                            else result[key] = (inner(instance)[key]);
                                        }
                                    });
                                } else {console.log("else");}
                            });

                            console.log("BATCH_RESULT", result);

                            if (
                                (result.length !== response.get_instance50.answer.total) &&
                                (response.get_instance50.answer.total) &&
                                (inner("get_instance50").length !== 0)
                            ) {
                                resolve(getBatch(batch, params));
                            } else {
                                resolve(result);
                            }
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        try {
            return await getBatch(batch, params);
        } catch (error) {
            console.error(error);
        }
    }
    static async BXbatchOnce(batch, params = {}, startIndex = 0) {

        let result = [], resultIds = [], start = Number(startIndex), limit = 50;
        let found, inner, counter = 0;

        var formMethod = function(){

            let method = {};
            let index = 1;

            for (let i = start; i <= start + 50; i+=50){

                const local_params = Object.assign({}, params);

                local_params.start = i;
                local_params.limit = limit;

                method[`get_instance${index}`] = [batch, local_params];
                index++;
            }

            return method;
        }

        async function getBatch(batch, params) {

            return new Promise(async (resolve, reject) => {
                try {
                    await BX24.callBatch(formMethod(),
                        function (response) {

                            if (response.get_instance1.answer.result.fields) inner = (instance) => {return response[instance].answer.result.fields};
                            else if (response.get_instance1.answer.result.types) inner = (instance) => {return response[instance].answer.result.types};
                            else if (response.get_instance1.answer.result.items) inner = (instance) => {return response[instance].answer.result.items};
                            else inner = (instance) => {return response[instance].answer.result};

                            Object.keys(response).forEach((instance) => {
                                if (inner(instance) && inner(instance).length !== 0) result = result.concat(inner(instance));
                                else console.log("else");
                            });

                            console.log("BATCH_ONCE_RESULT", response);

                            resolve(result);
                        });
                } catch (error) {
                    reject(error);
                }
            });

        }

        try {
            return await getBatch(batch, params);
        } catch (error) {
            console.error(error);
        }
    }
    static async BXcheckTotal(batch, params = {}) {

        let inner;

        return new Promise(async (resolve, reject) => {
            try {
                await BX24.callBatch({
                        get_instance1: [batch, params]
                    },
                    function (response) {

                        if (response.get_instance1.answer.result.fields) inner = () => {
                            return response.get_instance1.answer.result.fields;
                        };
                        else if (response.get_instance1.answer.result.types) inner = () => {
                            return response.get_instance1.answer.result.types;
                        };
                        else if (response.get_instance1.answer.result.items) inner = () => {
                            return response.get_instance1.answer.result.items;
                        };
                        else inner = () => {
                            return response.get_instance1.answer.result;
                        };

                        console.log("CHECK_TOTAL_RESULT", response);

                        if (
                            (response.get_instance1.answer.total) &&
                            (inner().length !== 0)
                        ) {
                            resolve({
                                totalMore: true,
                                total: response.get_instance1.answer.total
                            });
                        } else {
                            resolve({
                                totalMore: false,
                                total: 0
                            });
                        }
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
}

// класс лоадера операций
export class loader {
    static init() {
        this.loader = document.querySelector(".loader-container .container-loader");
        this.success = document.querySelector(".loader-container .container-success");
        this.faulture = document.querySelector(".loader-container .container-faulture");
    }


    static loadInit() {
        this.init();

        this.loader.style.display = "flex";
        this.success.style.display = "none";
        this.faulture.style.display = "none";
    }
    static successInit() {
        this.init();

        this.loader.style.display = "none";
        this.success.style.display = "flex";
        this.faulture.style.display = "none";

        this.hideAll();
    }
    static faultureInit() {
        this.init();

        this.loader.style.display = "none";
        this.success.style.display = "none";
        this.faulture.style.display = "flex";

        this.hideAll();
    }
    static hideAll() {
        this.init();

        setTimeout(() => {
            this.loader.style.display = "none";
            this.success.style.display = "none";
            this.faulture.style.display = "none";
        }, 2000);

    }
}

// класс для подключений компонентов битрикс
export class BXLoadUtils {
    static async bot(config) {

        this.data = {
            'CODE': `artSolution-${config.appName}`,
        };

        return await request.BXcall("imbot.unregister", this.data)
            .then((response) => {
                console.log(response);

                this.data = {
                    'CODE': `artSolution-${config.appName}`,
                    'TYPE': 'B',// Bot type
                    'EVENT_MESSAGE_ADD': `https://${config.serverHost}/${config.appName}/bot.php`,// Bot handler for new messages from user (req.)
                    'EVENT_WELCOME_MESSAGE': `https://${config.serverHost}/${config.appName}/bot.php`,// Bot handler for joining to a chat (req.)
                    'EVENT_BOT_DELETE': `https://${config.serverHost}/${config.appName}/bot.php`,// Bot handler for deleting bot (req.)
                    'PROPERTIES': { // Bot personality (req.)
                        'NAME': 'Art24',// Bot name (NAME or LAST_NAME is required)
                        'LAST_NAME': 'Bot',// Bot last name
                        'COLOR': 'AQUA',// Bot color for mobile Bitrix24 application RED,  GREEN, MINT, LIGHT_BLUE, DARK_BLUE, PURPLE, AQUA, PINK, LIME, BROWN,  AZURE, KHAKI, SAND, MARENGO, GRAY, GRAPHITE
                        'EMAIL': 'info@artsolution24.ru',
                        'PERSONAL_BIRTHDAY': '2023-04-23',// format YYYY-mm-dd
                        'WORK_POSITION': '',// Bot 'job-title' as a bot description
                        'PERSONAL_WWW': 'https://artsolution24.ru/',
                        'PERSONAL_GENDER': 'M',// Bot gender
                    },
                };

                return request.BXcall("imbot.register", this.data);
            })
            .then((response) => {
                console.log(response);

                return true;
            })
            .catch((error) => {
                console.error(error);

                return false;
            })
    }
    static async placement(config) {

        this.data = {
            "PLACEMENT": "REST_APP_URI",
            'HANDLER': `https://${config.serverHost}/${config.appName}/placement.php`,
        };

        return await request.BXcall("placement.unbind", this.data)
            .then((response) => {
                console.log(response);

                return request.BXcall("placement.bind", this.data);
            })
            .then((response) => {
                console.log(response);

                return true;
            })
            .catch((error) => {
                console.error(error);

                return false;
            })
    }
    static async activity() {

        this.data = {
            'CODE': "sp1"
        }

        return await request.BXcall("bizproc.activity.delete", this.data)
            .then((response) => {
                console.log(response);

                this.data = {
                    'CODE': 'sp1',
                    'HANDLER': `https://${config.serverHost}/${config.appName}/activityHandler.php`,
                    'AUTH_USER_ID': 1,
                    'USE_SUBSCRIPTION': 'Y',
                    'USE_PLACEMENT': 'Y',
                    'PLACEMENT_HANDLER': `https://${config.serverHost}/${config.appName}/activity.php`, // интерфейс действия
                    'NAME': {
                        'ru': 'Название активити',
                        'en': 'Название активити'
                    },
                    'DESCRIPTION': {
                        'ru': 'Activity title',
                        'en': 'Activity title'
                    },
                    'PROPERTIES': {
                        'Параметр': {
                            'Name': 'Название',
                            'Type': 'string',
                            'Required': 'Y',
                            'Multiple': 'N',
                            'Default': null
                        },
                    },
                    'RETURN_PROPERTIES': {
                        'Вовзращаемое значение': {
                            'Name': 'Название',
                            'Type': 'string',
                            'Multiple': 'N',
                            'Default': null
                        }
                    }
                };

                return request.BXcall("bizproc.activity.add", this.data);
            })
            .then((response) => {
                console.log(response);

                return true;
            })
            .catch((error) => {
                console.error(error);

                return false;
            });
    }
}

export class UI {
    static resizeFrame(){
        let frame = document.querySelector("body");

        let height = frame.offsetHeight;
        let width = frame.offsetWidth;

        console.log(width, height);

        BX24.resizeWindow(width, height + 60);
        // BX24.fitWindow();
    }
}
