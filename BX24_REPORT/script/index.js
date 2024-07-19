import {checker} from "/local_otchet/script/handler.js";
import {request} from "/local_otchet/script/handler.js";
import {loader} from "/local_otchet/script/handler.js";
import {UI} from "/local_otchet/script/handler.js";

class App{

    static workers = [];
    static grandWorkers = [];
    static menuConfig = [];

    static config = {
        serverHost: document.querySelector('script[src="script/index.js"]').dataset.host,
        serverPath: document.querySelector('script[src="script/index.js"]').dataset.path,
        appName: document.querySelector('script[src="script/index.js"]').dataset.name,
    };

    static async preproc(){
        if (await checker.init(this.config)){

            // Получение нужныхх данных
            return await request.BXcall("user.get")
                .then((response) => {
                    console.log("WORKERS", response);
                    App.workers = response;

                    this.data = {
                        type: 'load grand for workers',
                        portal: this.config.serverPath,
                    };

                    return request.AJAX(this.data, this.config);
                })
                .then((response) => {
                    console.log("GRAND_WORKERS", response);
                    App.grandWorkers = response;

                    this.data = {
                        type: 'load menu data json',
                        portal: this.config.serverPath,
                    };

                    return request.AJAX(this.data, this.config);
                })
                .then((response) => {
                    console.log("MENU_CONFIG", response);
                    App.menuConfig = response;
                    loader.successInit();

                    return true;
                })
                .catch((error) => {
                    console.error(error);
                    loader.faultureInit();

                    return false;
                });
        } else {

            // Отображение сообщения о закрытом доступе
            alert("Вам не выделен доступ к этому приложению!");

            loader.faultureInit();

            return false;
        }
    }
    static async init(){

        UI.resizeFrame();
        loader.loadInit();

        if (await this.preproc()){
            this.initUI();
        }
    }

    static initUI() {
        function addAdminPanel(){

            const actions_list_button = document.querySelector(".more-button");
            const actions_list_block = document.querySelector(".actions-list-block");
            const grand_access = document.querySelector(".grand-access");
            const grand_access_block = document.querySelector(".grand-access-block");
            const applygrand = document.querySelector(".apply-grand-access");
            const cancelgrand = document.querySelector(".cancel-grand-aсcess");

            var rect = actions_list_button.getBoundingClientRect(); // Получаем координаты элемента-ссылки

            // Устанавливаем координаты нового элемента
            actions_list_block.style.position = 'absolute';
            actions_list_block.style.left = rect.left + 'px';
            actions_list_block.style.top = rect.top + rect.height + 'px';

            actions_list_button.addEventListener('click', function (){
                if (actions_list_button.classList.contains("opened")){
                    actions_list_block.style.display = "none";
                    actions_list_button.querySelector('img').src = "src/free-icon-font-angle-small-left-3916892.png";

                    actions_list_button.classList.remove("opened")
                } else {
                    actions_list_block.style.display = "block";
                    actions_list_button.querySelector('img').src = "src/upurrow.png";

                    actions_list_button.classList.add("opened")
                }
            });
            grand_access.addEventListener("click", function (){
                grand_access_block.style.display = "flex";
            });
            applygrand.addEventListener("click", function (){
                grand_access_block.style.display = "none";

                let data = {
                    type: "save grand for workers",
                    path: App.config.serverPath,
                    workers: JSON.stringify(App.grandWorkers),
                }

                request.AJAX(data, App.config);
            });
            cancelgrand.addEventListener("click", function (){
                grand_access_block.style.display = "none";
            });

            // Получаем блок div, в который будем выводить список пользователей
            var workers_block = document.querySelector(".workers-block");
            var workers_inner_block = document.querySelector(".workers-block-scroll");

            // Обходим массив пользователей и добавляем данные каждого пользователя в строку
            App.workers.forEach((user) => {
                let workerrow = document.createElement('div');
                workerrow.className = "worker-row"

                let checkbox = document.createElement('input');
                checkbox.id = user.ID;
                checkbox.type = "checkbox";
                checkbox.className = "worker-checkbox";

                if (App.grandWorkers.includes(user.ID)) checkbox.checked = true;
                else checkbox.checked = false;

                let text = document.createElement('span');
                text.innerHTML = user.NAME + " " + user.LAST_NAME + " (" + user.EMAIL + ")";

                workerrow.appendChild(checkbox);
                workerrow.appendChild(text);
                workers_inner_block.appendChild(workerrow);
                workers_block.appendChild(workers_inner_block);

                checkbox.addEventListener("change", function (){
                    if (checkbox.checked) App.grandWorkers.push(user.ID);
                    else {
                        let index = App.grandWorkers.indexOf(user.ID); // находим индекс элемента с заданным userID в массиве

                        if (index !== -1) App.grandWorkers.splice(index, 1); // удаляем элемент из массива
                    }
                });
            });
        }
        function mainUI(){

        }
        function addEventHandlers(){
            $("#report-param-panel-create").addEventListener("click", function (){Menu.showReport();});
            $("#report-table-export").addEventListener("click", function (){Menu.tableExport();});
            $("#report-plus").addEventListener("click", function (){Menu.createReport();});
            $("#param-block-1-href").addEventListener("click", function (){Menu.param_block_switcher(this);});
            $("#param-block-2-href").addEventListener("click", function (){Menu.param_block_switcher(this);});
        }

        Menu.initUI();
        mainUI();
        addEventHandlers();

        if (BX24.isAdmin()) addAdminPanel();
    }
}

class List{

    static async preproc(){

    }
    static async init(){
        await this.preproc();
    }
}

class Menu {

    static arrayjson;
    static arrayjson_open;
    static entityes = null;
    static datebegin = null;
    static dateend = null;
    static reportName = null;
    static reportDescription = null;
    static click_name = null;
    static selectedValues = null;
    static main_reportName = null;

    static workers = [];
    static users = [];

    static showReport() {
        workers = [];
        Object.values(document.getElementById('worker').selectedOptions).forEach(item => {
            workers.push(item.value);
        });

        workers = [...new Set(workers)];

        dateend = document.getElementById('dateend').value
        datebegin = document.getElementById('datebegin').value
        if ((reportName = document.getElementById('report-name').value) === undefined) reportName = 'null';
        if ((reportDescription = document.getElementById('report-description').value) === undefined) reportDescription = 'null';

        if (selectedValues.length !== 0 && reportName !== 'null' && reportDescription !== 'null' && workers.length !== 0) {
            var valid_value = true;
            arrayjson.forEach(content => {
                if (content['reportName'] === reportName) {
                    valid_value = false;
                    if (arrayjson_open[4] === reportName) {
                        valid_value = true;
                    }
                }
            });
            if (valid_value) {
                let block = document.querySelector("#report-param-block");
                let table = document.querySelector("#report-table-block");
                let create = document.querySelector("#report-param-panel-create");
                let table_export = document.querySelector("#report-table-export");

                let newdate = (new Date()).getDate() + '.' + ((new Date()).getMonth() + 1) + '.' + (new Date()).getFullYear();

                $.ajax({
                    type: 'POST',
                    url: 'ajax.php',
                    data: {
                        'entityes': selectedValues,
                        'datebegin': datebegin,
                        'dateend': dateend,
                        'workers': workers,
                        'reportName': reportName,
                        'reportDescription': reportDescription,
                        'date': newdate,
                        'path': App.config.serverPath,
                        'mainName': main_reportName,
                        'type': 'ajax to write',
                        'writetype': create.dataset.writetype,
                    },
                    success: function () {
                        var loader = document.querySelector('.loader-container');
                        loader.style.display = "block";

                        //window.location.href = 'extra-report-table-window.php?path=' + '<?php //=$SERVER_PATH;?>//';
                        if (create.dataset.writetype === "new") {
                            updateReportsList(reportName, newdate);
                        }

                        block.style.display = "none";
                        table.style.display = "block";
                        create.style.display = "none";
                        table_export.style.display = "block";

                        let table_table = document.querySelector("#table");
                        let thead = document.createElement("tr");

                        table_table.innerHTML = "";
                        table_table.appendChild(thead);
                        thead.id = "table-head";

                        var result_batch;
                        var entity_compare = [];
                        var entity_dictionary = {
                            "ACTIVITY#DIRECTION#MISSED": "пропущенный звонок",
                            "ACTIVITY#DIRECTION#INTERNAL": "внутренняя коммуникация",

                            "ACTIVITY#NOTIFY_TYPE#IMMEDIATELY": "немедленное уведомление",
                            "ACTIVITY#NOTIFY_TYPE#SUMMARY": "сводка уведомлений",
                            "ACTIVITY#NOTIFY_TYPE#DELAYED": "отложенное уведомление",

                            "COMPANY#COMPANY_TYPE#CUSTOMER": "клиент или заказчик",
                            "COMPANY#COMPANY_TYPE#PARTNER": "партнер компании",
                            "COMPANY#COMPANY_TYPE#SUPPLIER": "поставщик компании",
                            "COMPANY#COMPANY_TYPE#COMPETITOR": "конкурент компании",
                            "COMPANY#COMPANY_TYPE#OTHER": "другой тип компании",

                            "DEAL#SOURCE_ID#CALL": "Звонок",
                            "DEAL#SOURCE_ID#EMAIL": "Электронная почта",
                            "DEAL#SOURCE_ID#WEB": "Веб-сайт",
                            "DEAL#SOURCE_ID#ADVERTISING": "Реклама",
                            "DEAL#SOURCE_ID#REPEAT_SALES": "Существующий клиент",
                            "DEAL#SOURCE_ID#RECOMMENDATION": "По рекомендации",
                            "DEAL#SOURCE_ID#EXHIBITION": "Выставка",
                            "DEAL#SOURCE_ID#CRM_FORM": "CRM-форма",
                            "DEAL#SOURCE_ID#CALLBACK": "Обратный звонок",
                            "DEAL#SOURCE_ID#SALES_GENERATOR": "Генератор продаж",
                            "DEAL#SOURCE_ID#ECOMM": "Интернет-магазин",

                            "DEAL#CATEGORY_ID#0": "Нет категории",
                            "DEAL#CATEGORY_ID#1": "Продажи",
                            "DEAL#CATEGORY_ID#2": "Консультации",
                            "DEAL#CATEGORY_ID#3": "Проекты",

                            "DEAL#TYPE_ID#SALE": "ПРОДАЖА",
                            "DEAL#TYPE_ID#PURCHASE": "ПОКУПКА",
                            "DEAL#TYPE_ID#DEAL": "СДЕЛКА",
                            "DEAL#TYPE_ID#QUOTE": "ПРЕДЛОЖЕНИЕ",
                            "DEAL#TYPE_ID#SERVICE": "СЕРВИС",
                            "DEAL#TYPE_ID#RENT": "АРЕНДА",

                            "DEAL#STAGE_ID#NEW": "НОВЫЙ",
                            "DEAL#STAGE_ID#PREPARATION": "ПОДГОТОВКА",
                            "DEAL#STAGE_ID#PRESENTATION": "ПРЕЗЕНТАЦИЯ",
                            "DEAL#STAGE_ID#NEGOTIATION": "ПРЕГОВОРЫ",
                            "DEAL#STAGE_ID#WON": "ВЫИГРАНА",
                            "DEAL#STAGE_ID#FAILED": "ПРОИГРАНА",
                            "DEAL#STAGE_SEMANTIC_ID#P": "ПРОГРЕСС",
                            "DEAL#STAGE_SEMANTIC_ID#S": "УСПЕХ",
                            "DEAL#STAGE_SEMANTIC_ID#F": "ПРОВАЛ",

                            "DEAL#IS_MANUAL_OPPORTUNITY#Y": "СУММА ВОЗМОЖНОЙ ПРИБЫЛИ БЫЛА УСТАНОВЛЕНА В РУЧНУЮ",
                            "DEAL#IS_MANUAL_OPPORTUNITY#N": "СУММА ВОЗМОЖНОЙ ПРИБЫЛИ БЫЛА АВТОМАТИЧЕСКИ РАССЧИТАНА",

                            "DEAL#IS_REPEATED_APPROACH#Y": "СДЕЛКА ЯВЛЕТСЯ ПОВТОРНЫМ КОНТАКТОМ ИЛИ ПРИБЛИЖЕНИЕМ К КЛИЕНТУ",
                            "DEAL#IS_REPEATED_APPROACH#N": "СДЕЛКА ЯВЛЯЕТСЯ ПЕРВЫМ КОНТАКТОМ С КЛИЕНТОМ",

                            "DEAL#IS_RETURN_CUSTOMER#Y": "ПОСТОЯННЫЙ ИЛИ ПОВТОРНЫЙ КЛИЕНТ",
                            "DEAL#IS_RETURN_CUSTOMER#N": "НОВЫЙ КЛИЕНТ",

                            "DEAL#IS_RECURRING#Y": "СДЕЛКА ПОВТОРЯЮЩАЯСЯ ИЛИ РЕГУЛЯРНАЯ",
                            "DEAL#IS_RECURRING#N": "ОДНОРАЗОВАЯ СДЕЛКА",

                            "DEAL#OPENED#Y": "СДЕЛКА ОТКРЫТА ДЛЯ ДОСТУПА",
                            "DEAL#OPENED#N": "СДЕЛКА ОГРАНИЧЕНА ПО ДОСТУПУ",

                            "DEAL#CLOSED#Y": "СДЕЛКА ЗАКРЫТА",
                            "DEAL#CLOSED#N": "СДЕЛКА ОТКРЫТА",

                            "DEAL#IS_NEW#Y": "НОВАЯ СДЕЛКА",
                            "DEAL#IS_NEW#N": "СДЕЛКА НАХОДИТСЯ В РАБОТЕ",

                            "ACTIVITY#OWNER_TYPE_ID#DEAL": "СДЕЛКА",
                            "ACTIVITY#OWNER_TYPE_ID#CONTACT": "КОНТАКТ",
                            "ACTIVITY#OWNER_TYPE_ID#COMPANY": "КОМПАНИЯ",
                            "ACTIVITY#OWNER_TYPE_ID#LEAD": "ЛИД",

                            "ACTIVITY#TYPE_ID#MEETING": "ВСТРЕЧА",
                            "ACTIVITY#TYPE_ID#TASK": "ЗАДАЧА",
                            "ACTIVITY#TYPE_ID#EMAIL": "ПОЧТА",
                            "ACTIVITY#TYPE_ID#WEBFORM": "ВЕБ-ФОРМА",
                            "ACTIVITY#TYPE_ID#CHAT": "ЧАТ",
                            "ACTIVITY#TYPE_ID#VISIT": "ВИЗИТ",
                            "ACTIVITY#TYPE_ID#OTHER": "ДРУГОЕ",
                            "ACTIVITY#TYPE_ID#CALL": "ЗВОНОК",

                            "ACTIVITY#PROVIDER_TYPE_ID#CRM ": "CRM",
                            "ACTIVITY#PROVIDER_TYPE_ID#IMOPENLINES": "ОТКРЫТЫЕ ЛИНИИ",
                            "ACTIVITY#PROVIDER_TYPE_ID#REST": "REST",
                            "ACTIVITY#PROVIDER_TYPE_ID#CALENDAR": "КАЛЕНДАРЬ",
                            "ACTIVITY#PROVIDER_TYPE_ID#TASKS": "ЗАДАЧИ",
                            "ACTIVITY#PROVIDER_TYPE_ID#TELEPHONY": "ТЕЛЕФОНИЯ",
                            "ACTIVITY#PROVIDER_TYPE_ID#EMAIL": "ПОЧТА",
                            "ACTIVITY#PROVIDER_TYPE_ID#WEBFORM": "ВЕБ-ФОРМА",
                            "ACTIVITY#PROVIDER_TYPE_ID#CALL_TRACKER": "ТРЕКЕР ЗВОНКОВ",
                            "ACTIVITY#PROVIDER_TYPE_ID#CHAT": "ЧАТ",

                            "ACTIVITY#COMPLETED#Y": "ВЫПОЛНЕНО",
                            "ACTIVITY#COMPLETED#N": "НЕ ВЫПОЛНЕНО",

                            "ACTIVITY#STATUS#PLANNED": "СТАТУС:ЗАПЛАНИРОВАНО",
                            "ACTIVITY#STATUS#COMPLETED": "СТАТУС:ВЫПОЛНЕНО",
                            "ACTIVITY#STATUS#POSTPONED": "СТАТУС:ОТЛОЖЕНО",
                            "ACTIVITY#STATUS#DECLINED": "СТАТУС:ОТКЛОНЕНО",
                            "ACTIVITY#STATUS#STARTED": "СТАТУС:НАЧАЛОСЬ",

                            "ACTIVITY#PRIORITY#HIGH": "ВЫСОКИЙ ПРИОРИТЕТ",
                            "ACTIVITY#PRIORITY#NORMAL": "СРЕДНИЙ ПРИОРИТЕТ",
                            "ACTIVITY#PRIORITY#LOW": "НИЗКИЙ ПРИОРИТЕТ",

                            "ACTIVITY#NOTIFY_TYPE#EMAIL": "УВЕДОМЛЕНИЕ ОТПРАВЛЕНО ПО ПОЧТЕ",
                            "ACTIVITY#NOTIFY_TYPE#SYSTEM": "УВЕДОМЛЕНИЕ ОТПРАВЛЕНО ЧЕРЕЗ СИСТЕМУ",
                            "ACTIVITY#NOTIFY_TYPE#NONE": "УВЕДОМЛЕНИЕ НЕ ОТПРАВЛЕНО",

                            "ACTIVITY#DESCRIPTION_TYPE#PLAIN": "ОБЫЧНЫЙ ТЕКСТ",
                            "ACTIVITY#DESCRIPTION_TYPE#HTML": "ТЕКСТ В ФОРМАТЕ HTML",

                            "ACTIVITY#DIRECTION#INCOMING": "ВХОДЯЩЕЕ НАПРАВЛЕНИЕ",
                            "ACTIVITY#DIRECTION#OUTGOING": "ИСХОДЯЩАЯ НАПРАВЛЕНЕ",

                            "ACTIVITY#RESULT_MARK#POSITIVE": "ПОЛОЖИТЕЛЬНЫЙ РЕЗУЛЬТАТ",
                            "ACTIVITY#RESULT_MARK#NEGATIVE": "ОТРИЦАТЕЛЬНЫЙ РЕЗУЛЬТАТ",

                            "ACTIVITY#RESULT_STATUS#SUCCESS": "УСПЕШНОЕ ВЫПОЛНЕНИЕ ЗАДАЧИ ИЛИ ДЕЛА",
                            "ACTIVITY#RESULT_STATUS#FAILED": "НЕУДАЧНОЕ ВЫПОЛНЕНИЕ ЗАДАЧИ ИЛИ ДЕЛА",

                            "ACTIVITY#RESULT_STREAM#INCOMING": "ПОТОК ВХОДЯЩИХ РЕЗУЛЬТАТОВ",
                            "ACTIVITY#RESULT_STREAM#OUTGOING": "ПОТОК ИСХОДЯЩИХ РЕЗУЛЬТАТОВ",

                            "ACTIVITY#AUTOCOMPLETE_RULE#NONE": "АВТОЗАПОЛНЕНИЕ НЕ ИСПОЛЬЗУЕТСЯ ",
                            "ACTIVITY#AUTOCOMPLETE_RULE#START_TIME": "ПОЛЕ ВРЕМЯ НАЧАЛА ЗАПОЛНЕНО АВТОМАТИЧЕСКИ",
                            "ACTIVITY#AUTOCOMPLETE_RULE#END_TIME": "ПОЛЕ ВРЕМЯ КОНЦА ЗАПОЛНЕНО АВТОМАТИЧЕСКИ",
                            "ACTIVITY#AUTOCOMPLETE_RULE#DURATION": "ПОЛЕ ПРОДОЛЖИТЕЛЬНОСТЬ ЗАПОЛНЕНО АВТОМАТИЧЕСКИ",
                            "ACTIVITY#AUTOCOMPLETE_RULE#RESPONSIBLE_ID": "ПОЛЕ ОТВЕТСТВЕННЫЙ ЗАПОЛНЕНО АВТОМАТИЧЕСКИ",
                            "ACTIVITY#AUTOCOMPLETE_RULE#ORIGIN_ID": "ИСТОЧНИК ЗАДАЧИ ИЛИ ДЕЛА ЗАПОЛНЕН АВТОМАТИЧЕСКИ",
                            "ACTIVITY#AUTOCOMPLETE_RULE#ORIGINATOR_ID": "ИДЕНТИФИКАТОР ПОЛЬЗОВАТЕЛЯ ЗАПОЛНЕН АВТОМАТИЧЕСКИ",

                            "OFFER#STATUS_ID#DRAFT": "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ НАХОДИТСЯ В СТАДИИ ЧЕРНОВИК",
                            "OFFER#STATUS_ID#SENT": "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ БЫЛО ОТПРАВЛЕНО КЛИЕНТУ",
                            "OFFER#STATUS_ID#APPROVED": "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ БЫЛО ОДОБРЕННО КЛИЕНТОМ",
                            "OFFER#STATUS_ID#DECLINED": "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ БЫЛО ОТКЛОНЕНО КЛИЕНТОМ",
                            "OFFER#STATUS_ID#WAITING": "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ НАХОДИТСЯ В ОЖИДАНИИ РЕШЕНИЯ КЛИЕНТА",

                            "OFFER#OPENED#Y": "БЫЛО ОТКРЫТО КЛИЕНТОМ",
                            "OFFER#OPENED#N": "НЕ БЫЛО ОТКРЫТО КЛИЕНТОМ",

                            "OFFER#CLOSED#Y": "БЫЛО ЗАКРЫТО",
                            "OFFER#CLOSED#N": "НЕ БЫЛО ЗАКРЫТО",

                            "CONTACT#SOURCE_ID#CALL": "Звонок",
                            "CONTACT#SOURCE_ID#EMAIL": "Электронная почта",
                            "CONTACT#SOURCE_ID#WEB": "Веб-сайт",
                            "CONTACT#SOURCE_ID#ADVERTISING": "Реклама",
                            "CONTACT#SOURCE_ID#REPEAT_SALES": "Существующий клиент",
                            "CONTACT#SOURCE_ID#RECOMMENDATION": "По рекомендации",
                            "CONTACT#SOURCE_ID#EXHIBITION": "Выставка",
                            "CONTACT#SOURCE_ID#CRM_FORM": "CRM-форма",
                            "CONTACT#SOURCE_ID#CALLBACK": "Обратный звонок",
                            "CONTACT#SOURCE_ID#SALES_GENERATOR": "Генератор продаж",
                            "CONTACT#SOURCE_ID#ECOMM": "Интернет-магазин",

                            "CONTACT#EXPORT#Y": "КОНТАКТ БЫЛ ЭКСПОРТИРОВАН В ФАЙЛ",
                            "CONTACT#EXPORT#N": "КОНТАКТ НЕ ЭКСПОРТИРОВАН В ФАЙЛ",

                            "CONTACT#HAS_PHONE#Y": "ЕСТЬ НОМЕР ТЕЛЕФОН",
                            "CONTACT#HAS_PHONE#N": "НЕТ НОМЕРА ТЕЛЕФОНА",

                            "CONTACT#HAS_EMAIL#Y": "ЕСТЬ ПОЧТА",
                            "CONTACT#HAS_EMAIL#N": "НЕТ ПОЧТЫ",

                            "CONTACT#HAS_IMOL#Y": "ЕСТЬ ПОДКЛЮЧЕНИЕ К МЕССЕНДЖЕРУ В CRM БИТРИКС24",
                            "CONTACT#HAS_IMOL#N": "НЕТ  ПОДКЛЮЧЕНИЯ К МЕССЕНДЖЕРУ В CRM БИТРИКС24",

                            "CONTACT#OPENED#Y": "КОНТАКТ БЫЛ ОТКРЫТ",
                            "CONTACT#OPENED#N": "КОНТАКТ НЕ БЫЛ ОТКРЫТ",

                            "CONTACT#TYPE_ID#PARTNER": "КОНТАКТ ЯВЛЯЕТСЯ ПАРТНЕРОМ",
                            "CONTACT#TYPE_ID#CLIENT": "КОНТАКТ ЯВЛЯЕТСЯ КЛИЕНТОМ",
                            "CONTACT#TYPE_ID#REFERRAL": "КОНТАКТ ЯВЛЯЕТСЯ РЕФЕРРАЛОМ",

                            "LEAD#SOURCE_ID#CALL": "Звонок",
                            "LEAD#SOURCE_ID#EMAIL": "Электронная почта",
                            "LEAD#SOURCE_ID#WEB": "Веб-сайт",
                            "LEAD#SOURCE_ID#ADVERTISING": "Реклама",
                            "LEAD#SOURCE_ID#REPEAT_SALES": "Существующий клиент",
                            "LEAD#SOURCE_ID#RECOMMENDATION": "По рекомендации",
                            "LEAD#SOURCE_ID#EXHIBITION": "Выставка",
                            "LEAD#SOURCE_ID#CRM_FORM": "CRM-форма",
                            "LEAD#SOURCE_ID#CALLBACK": "Обратный звонок",
                            "LEAD#SOURCE_ID#SALES_GENERATOR": "Генератор продаж",
                            "LEAD#SOURCE_ID#ECOMM": "Интернет-магазин",

                            "LEAD#STATUS_ID#NEW": "ЛИД НАХОДИТСЯ В СТАДИИ НОВЫЙ",
                            "LEAD#STATUS_ID#IN_PROCESS": "ЛИД НАХОДИТСЯ В СТАДИИ В ПРОЦЕССЕ",
                            "LEAD#STATUS_ID#CONVERTED": "ЛИД БЫЛ ПРЕОБРАЗОВАН",
                            "LEAD#STATUS_ID#JUNK": "ЛИД БЫЛ ОТБРОШЕН",
                            "LEAD#STATUS_ID#CONTACT": "ЛИД БЫЛ ПРЕОБРАЗОВАН ТОЛЬКО В КОНТАКТ",
                            "LEAD#STATUS_ID#COMPANY": "ЛИД БЫЛ ПРЕОБРАЗОВАН ТОЛЬКО В КОМПАНИБ",

                            "LEAD#IS_RETURN_CUSTOMER#Y": "ЛИД ЯВЛЯЕТСЯ ПОВТОРНЫМ КЛИЕНТОМ",
                            "LEAD#IS_RETURN_CUSTOMER#N": "ЛИД ЯВЛЯЕТСЯ НОВЫМ КЛИЕНТОМ ",

                            "LEAD#IS_MANUAL_OPPORTUNITY#Y": "СУММА ПОТЕНЦИАЛЬНОЙ ВЫРУЧКИ БЫЛА УСТАНОВЛЕНА ВРУЧНУЮ",
                            "LEAD#IS_MANUAL_OPPORTUNITY#N": "СУММА ПОТЕНЦИАЛЬНОЙ ВЫРУЧКИ БЫЛА УСТАНОВЛЕНА АВТОМАТИЧЕСКИ",

                            "LEAD#HAS_PHONE#Y": "ЕСТЬ НОМЕР ТЕЛЕФОНА",
                            "LEAD#HAS_PHONE#N": "НЕТ НОМЕРА ТЕЛЕФОНА",

                            "LEAD#HAS_EMAIL#Y": "ЕСТЬ ПОЧТА",
                            "LEAD#HAS_EMAIL#N": "НЕТ ПОЧТЫ",

                            "LEAD#HAS_IMOL#Y": "ЕСТЬ ПОДКЛЮЧЕНИЕ К МЕССЕНДЖЕРУ В CRM БИТРИКС24",
                            "LEAD#HAS_IMOL#N": "НЕТ  ПОДКЛЮЧЕНИЯ К МЕССЕНДЖЕРУ В CRM БИТРИКС24",

                            "LEAD#STATUS_SEMANTIC_ID#Y": "СТАТУС ЛИДА ИМЕЕТ ПОТЕНЦИАЛ ДЛЯ ДАЛЬНЕЙШЕЙ РАБОТЫ",
                            "LEAD#STATUS_SEMANTIC_ID#N": "СТАТУС ЛИДА НЕ ИМЕЕТ ПОТЕНЦИАЛ ДЛЯ ДАЛЬНЕЙШЕЙ РАБОТЫ",

                            "LEAD#OPENED#Y": "БЫЛ ОТКРЫТ КЛИЕНТОМ",
                            "LEAD#OPENED#N": "НЕ БЫЛ ОТКРЫТ КЛИЕНТОМ",

                            "INVOICE#categoryId#0": "Нет категории",
                            "INVOICE#categoryId#1": "Продажи",
                            "INVOICE#categoryId#2": "Консультации",
                            "INVOICE#categoryId#3": "Проекты",

                            "INVOICE#stageId#NEW": "Новая",
                            "INVOICE#stageId#IN_PROCESS": "В работе",
                            "INVOICE#stageId#WON": "Закрыта",
                            "INVOICE#stageId#LOSE": "Не закрыта",

                            "INVOICE#opened#Y": "БЫЛ ОТКРЫТ КЛИЕНТОМ",
                            "INVOICE#opened#N": "НЕ БЫЛ ОТКРЫТ КЛИЕНТОМ",

                            "INVOICE#isManualOpportunity#Y": "СУММА ПОТЕНЦИАЛЬНОЙ ВЫРУЧКИ БЫЛА УСТАНОВЛЕНА ВРУЧНУЮ",
                            "INVOICE#isManualOpportunity#N": "СУММА ПОТЕНЦИАЛЬНОЙ ВЫРУЧКИ БЫЛА УСТАНОВЛЕНА АВТОМАТИЧЕСКИ",

                            "PRODUCT#ACTIVE#Y": "ПРОУДКТ АКТИВЕН",
                            "PRODUCT#ACTIVE#N": "ПРОУДКТ НЕ АКТИВЕН",

                            "PRODUCT#VAT_INCLUDED#Y": "ДА",
                            "PRODUCT#VAT_INCLUDED#N": "НЕТ",

                            "PRODUCT#DESCRIPTION_TYPE#text": "ОБЫЧНЫЙ ТЕКСТ",
                            "PRODUCT#DESCRIPTION_TYPE#html": "ТЕКСТ В ФОРМАТЕ HTML",

                            "COMPANY#ORIGIN_ID#0": "Нет источника",
                            "COMPANY#ORIGIN_ID#1": "Реклама",
                            "COMPANY#ORIGIN_ID#2": "Наши менеджеры",
                            "COMPANY#ORIGIN_ID#3": "Партнеры",
                            "COMPANY#ORIGIN_ID#4": "Сайт",
                            "COMPANY#ORIGIN_ID#5": "Рекомендации",
                            "COMPANY#ORIGIN_ID#6": "Переговоры",
                            "COMPANY#ORIGIN_ID#7": "E-mail-рассылки",
                            "COMPANY#ORIGIN_ID#8": "Телефонные звонки",
                            "COMPANY#ORIGIN_ID#9": "Социальные сети",
                            "COMPANY#ORIGIN_ID#10": "Другое",

                            "COMPANY#HAS_PHONE#Y": "ЕСТЬ НОМЕРА ТЕЛЕФОНА",
                            "COMPANY#HAS_PHONE#N": "НЕТ НОМЕРА ТЕЛЕФОНА",

                            "COMPANY#HAS_EMAIL#Y": "ЕСТЬ ПОЧТА",
                            "COMPANY#HAS_EMAIL#N": "НЕТ ПОЧТЫ",

                            "COMPANY#HAS_IMOL#Y": "ЕСТЬ ПОДКЛЮЧЕНИЕ К МЕССЕНДЖЕРУ В CRM БИТРИКС24",
                            "COMPANY#HAS_IMOL#N": "НЕТ  ПОДКЛЮЧЕНИЯ К МЕССЕНДЖЕРУ В CRM БИТРИКС24",

                            "COMPANY#IS_MY_COMPANY#Y": "ДА",
                            "COMPANY#IS_MY_COMPANY#N": "НЕТ",

                            "COMPANY#OPENED#Y": "БЫЛА ОТКРЫТА КЛИЕНТОМ",
                            "COMPANY#OPENED#N": "НЕ БЫЛА ОТКРЫТА КЛИЕНТОМ",
                        };
                        var entity_dictionary_except = {};
                        var deal_batch;
                        var productrows;
                        var activity_batch;
                        var offer_batch;
                        var contact_batch;
                        var lead_batch;
                        var invoice_batch;
                        var product_batch;
                        var company_batch;
                        var workers_batch;
                        var option;
                        var string;
                        var counter = 0;
                        var valueOfEntity_counter = 0;
                        var result_value;

                        function closeReport() {
                            window.location.href = 'index.php?path=' + App.config.serverPath;
                        }

                        function value_validator(entity, value, option) {
                            let key = entity + "#" + option + "#" + value;
                            if (entity_dictionary.hasOwnProperty(key)) {
                                return entity_dictionary[key];
                            } else {
                                if (entity_dictionary_except.hasOwnProperty(key)) {
                                } else {
                                    return value;
                                }
                            }
                        }

                        function comparer(index) {
                            return function (a, b) {
                                var valA = getCellValue(a, index), valB = getCellValue(b, index);
                                return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
                            }
                        }

                        function getCellValue(row, index) {
                            return $(row).children('td').eq(index).text()
                        }

                        // console.log(content);
                        // console.log(arrayjson);

                        /* Переданные данные для таблицы */
                        var selectedValues_choose = selectedValues;
                        var datebegin_choose = datebegin;
                        var dateend_choose = dateend;
                        var workers_choose = workers;
                        var reportName_choose = reportName;
                        var reportDescription_choose = reportDescription;

                        // console.log(selectedValues_choose);
                        // console.log(datebegin_choose);
                        // console.log(dateend_choose);
                        // console.log(workers_choose);
                        // console.log(reportName_choose);
                        // console.log(reportDescription_choose);

                        /* Батч запрос по сущностям */
                        let start = 0;
                        const limit = 50;

                        let batch = {
                            get_user: ['user.get', {start, limit}],
                            get_deal: ['crm.deal.list', {start, limit}],
                            get_case: ['crm.activity.list', {start, limit}],
                            get_offer: ['crm.quote.list', {start, limit}],
                            get_contact: ['crm.contact.list', {start, limit}],
                            get_lead: ['crm.lead.list', {start, limit}],
                            get_invoice: ['crm.item.list', {start, 'entityTypeId': 31, limit}],
                            get_product: ['crm.product.list', {start, limit}],
                            get_company: ['crm.company.list', {start, limit}],
                        };

                        let workers_checkvalue = [];
                        let deal_checkvalue = [];
                        let activity_checkvalue = [];
                        let offer_checkvalue = [];
                        let contact_checkvalue = [];
                        let lead_checkvalue = [];
                        let invoice_checkvalue = [];
                        let product_checkvalue = [];
                        let company_checkvalue = [];

                        let workers_result = [];
                        let deal_result = [];
                        let activity_result = [];
                        let offer_result = [];
                        let contact_result = [];
                        let lead_result = [];
                        let invoice_result = [];
                        let product_result = [];
                        let company_result = [];

                        let pointbar_stage = 0;
                        let pointbar = document.querySelector("#loader-point-bar-inner");
                        pointbar.textContent = "0%";

                        function getBatch(batch) {

                            // let allLists = [];
                            // let lists;

                            return new Promise(async (resolve, reject) => {
                                try {
                                    let res = await BX24.callBatch(batch, function (result) {
                                        // lists = result.getList.answer.result;
                                        if ('get_user' in batch) {
                                            workers_batch = result.get_user.answer.result;
                                        }
                                        if ('get_deal' in batch) {
                                            deal_batch = result.get_deal.answer.result;
                                        }
                                        if ('get_case' in batch) {
                                            activity_batch = result.get_case.answer.result;
                                        }
                                        if ('get_offer' in batch) {
                                            offer_batch = result.get_offer.answer.result;
                                        }
                                        if ('get_contact' in batch) {
                                            contact_batch = result.get_contact.answer.result;
                                        }
                                        if ('get_lead' in batch) {
                                            lead_batch = result.get_lead.answer.result;
                                        }
                                        if ('get_invoice' in batch) {
                                            invoice_batch = result.get_invoice.answer.result.items;
                                        }
                                        if ('get_product' in batch) {
                                            product_batch = result.get_product.answer.result;
                                        }
                                        if ('get_company' in batch) {
                                            company_batch = result.get_company.answer.result;
                                        }

                                        start += limit;
                                        batch = {
                                            get_user: ['user.get', {start, limit}],
                                            get_deal: ['crm.deal.list', {start, limit}],
                                            get_case: ['crm.activity.list', {start, limit}],
                                            get_offer: ['crm.quote.list', {start, limit}],
                                            get_contact: ['crm.contact.list', {start, limit}],
                                            get_lead: ['crm.lead.list', {start, limit}],
                                            get_invoice: ['crm.item.list', {start, 'entityTypeId': 31, limit}],
                                            get_product: ['crm.product.list', {start, limit}],
                                            get_company: ['crm.company.list', {start, limit}],
                                        };
                                        let batch_ended = true;

                                        if ('get_user' in batch) {
                                            if (workers_batch.length !== 0) {
                                                if (!workers_checkvalue.includes(workers_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    workers_result.push(workers_batch);
                                                } else {
                                                    delete batch.get_user
                                                }
                                                workers_checkvalue.push(workers_batch[0]['ID']);
                                            } else {
                                                delete batch.get_user;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_deal' in batch) {
                                            console.log(deal_batch, deal_result, deal_checkvalue);
                                            if (deal_batch.length !== 0) {
                                                if (!deal_checkvalue.includes(deal_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    deal_result.push(deal_batch);
                                                } else {
                                                    delete batch.get_deal
                                                }
                                                deal_checkvalue.push(deal_batch[0]['ID']);
                                            } else {
                                                delete batch.get_deal;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_case' in batch) {
                                            if (activity_batch.length !== 0) {
                                                if (!activity_checkvalue.includes(activity_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    activity_result.push(activity_batch);
                                                } else {
                                                    delete batch.get_case
                                                }
                                                activity_checkvalue.push(activity_batch[0]['ID']);
                                            } else {
                                                delete batch.get_case;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_offer' in batch) {
                                            if (offer_batch.length !== 0) {
                                                if (!offer_checkvalue.includes(offer_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    offer_result.push(offer_batch);
                                                } else {
                                                    delete batch.get_offer
                                                }
                                                offer_checkvalue.push(offer_batch[0]['ID']);
                                            } else {
                                                delete batch.get_offer;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_contact' in batch) {
                                            if (contact_batch.length !== 0) {
                                                if (!contact_checkvalue.includes(contact_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    contact_result.push(contact_batch);
                                                } else {
                                                    delete batch.get_contact
                                                }
                                                contact_checkvalue.push(contact_batch[0]['ID']);
                                            } else {
                                                delete batch.get_contact;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_lead' in batch) {
                                            if (lead_batch.length !== 0) {
                                                if (!lead_checkvalue.includes(lead_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    lead_result.push(lead_batch);
                                                } else {
                                                    delete batch.get_lead
                                                }
                                                lead_checkvalue.push(lead_batch[0]['ID']);
                                            } else {
                                                delete batch.get_lead;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_invoice' in batch) {
                                            if (invoice_batch.length !== 0) {
                                                if (!invoice_checkvalue.includes(invoice_batch[0]['id'])) {
                                                    batch_ended = false;
                                                    invoice_result.push(invoice_batch);
                                                } else {
                                                    delete batch.get_invoice
                                                }
                                                invoice_checkvalue.push(invoice_batch[0]['id']);
                                            } else {
                                                delete batch.get_invoice;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_product' in batch) {
                                            if (product_batch.length !== 0) {
                                                if (!product_checkvalue.includes(product_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    product_result.push(product_batch);
                                                } else {
                                                    delete batch.get_product
                                                }
                                                product_checkvalue.push(product_batch[0]['ID']);
                                            } else {
                                                delete batch.get_product;
                                                pointbar_stage++;
                                            }
                                        }
                                        if ('get_company' in batch) {
                                            if (company_batch.length !== 0) {
                                                if (!company_checkvalue.includes(company_batch[0]['ID'])) {
                                                    batch_ended = false;
                                                    company_result.push(company_batch);
                                                } else {
                                                    delete batch.get_company
                                                }
                                                company_checkvalue.push(company_batch[0]['ID']);
                                            } else {
                                                delete batch.get_company;
                                                pointbar_stage++;
                                            }
                                        }

                                        switch (pointbar_stage) {
                                            case 1:
                                                pointbar.textContent = "11%";
                                                break;
                                            case 2:
                                                pointbar.textContent = "22%";
                                                break;
                                            case 3:
                                                pointbar.textContent = "33%";
                                                break;
                                            case 4:
                                                pointbar.textContent = "44%";
                                                break;
                                            case 5:
                                                pointbar.textContent = "55%";
                                                break;
                                            case 6:
                                                pointbar.textContent = "66%";
                                                break;
                                            case 7:
                                                pointbar.textContent = "77%";
                                                break;
                                            case 8:
                                                pointbar.textContent = "88%";
                                                break;
                                            case 9:
                                                pointbar.textContent = "99%";
                                                break;
                                        }

                                        if (batch_ended) {
                                            console.log("FINISH: ", workers_result, deal_result, activity_result, offer_result, contact_result, lead_result, invoice_result, product_result, company_result);
                                            let result = {
                                                workers_result: workers_result,
                                                deal_result: deal_result,
                                                activity_result: activity_result,
                                                offer_result: offer_result,
                                                contact_result: contact_result,
                                                lead_result: lead_result,
                                                invoice_result: invoice_result,
                                                product_result: product_result,
                                                company_result: company_result,
                                            };
                                            resolve(result);
                                        } else {
                                            resolve(getBatch(batch));
                                        }
                                    });
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }

                        getBatch(batch)
                            .then((result) => {
                                console.log('Все:', result.workers_result.flat());
                                console.log('Все:', result.deal_result.flat());
                                console.log('Все:', result.activity_result.flat());
                                console.log('Все:', result.offer_result.flat());
                                console.log('Все:', result.contact_result.flat());
                                console.log('Все:', result.lead_result.flat());
                                console.log('Все:', result.invoice_result.flat());
                                console.log('Все:', result.product_result.flat());
                                console.log('Все:', result.company_result.flat());

                                workers_batch = result.workers_result.flat();
                                deal_batch = result.deal_result.flat();
                                activity_batch = result.activity_result.flat();
                                offer_batch = result.offer_result.flat();
                                contact_batch = result.contact_result.flat();
                                lead_batch = result.lead_result.flat();
                                invoice_batch = result.invoice_result.flat();
                                product_batch = result.product_result.flat();
                                company_batch = result.company_result.flat();

                                let deal_indexes_arr = [];
                                selectedValues_choose.forEach(valueOfEntity => {
                                    let valueOfEntity_substr = valueOfEntity.split('#');
                                    let valueOfEntity_class = valueOfEntity_substr[0];
                                    let valueOfEntity_option = valueOfEntity_substr[1];
                                    let valueOfEntity_name = valueOfEntity_substr[2];

                                    ($('<th id="header-th-sortable" title="' + valueOfEntity_name + '">' + valueOfEntity_name + '</th>')
                                        .appendTo('#table-head'));
                                });
                                deal_batch.forEach(deal => {
                                    deal_indexes_arr.push(deal['ID']);
                                });

                                BX24.callMethod(
                                    "crm.deal.productrows.get",
                                    {id: deal_indexes_arr},
                                    function (result) {
                                        // console.log("@@@@@@@@", result, deal_indexes_arr);

                                        pointbar.textContent = "100%";

                                        workers_choose.forEach(worker_choose => {
                                            deal_batch.forEach(deal => {
                                                entity_date_begin = new Date(deal['DATE_CREATE']);
                                                entity_date_end = new Date(deal['CLOSEDATE']);

                                                datebegin_choose = new Date(datebegin_choose);
                                                dateend_choose = new Date(dateend_choose);

                                                if (deal['CREATED_BY_ID'] === worker_choose
                                                    && entity_date_end >= datebegin_choose
                                                    && entity_date_end <= dateend_choose) {
                                                    counter++;
                                                    string = 'table-main-tr' + counter;
                                                    ($('<tr id=' + string + '></tr>')
                                                        .appendTo('#table'));

                                                    selectedValues_choose.forEach(valueOfEntity => {
                                                        let valueOfEntity_substr = valueOfEntity.split('#');
                                                        let valueOfEntity_class = valueOfEntity_substr[0];
                                                        let valueOfEntity_option = valueOfEntity_substr[1];

                                                        valueOfEntity_counter++;

                                                        switch (valueOfEntity_class) {
                                                            case "WORKER":
                                                                try {
                                                                    workers_batch.forEach(worker => {
                                                                        if (worker['ID'] === worker_choose) {
                                                                            let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                            let worker_href = 'https://' + arrayjson[7] + '/crm/company/personal/user/' + worker['ID'] + '/';

                                                                            if (worker_name === " ") {
                                                                                worker_name = worker['EMAIL'];
                                                                            }

                                                                            ($('<td></td>')
                                                                                    .appendTo('#' + string)
                                                                                    .append('<a href="' + worker_href + '" target="_blank">' + worker_name + '</a>')
                                                                            );

                                                                            throw new Error('value_found');
                                                                        }
                                                                    });
                                                                } catch (error) {
                                                                    if (error.message !== 'value_found') {
                                                                        throw error;
                                                                    }
                                                                }
                                                                break;
                                                            case "DEAL":
                                                                if (valueOfEntity_option === "WORK_KPI" || valueOfEntity_option === "EMPLOYEE_COMMISSION") {
                                                                    let deal_href = 'https://' + arrayjson[7] + '/crm/deal/details/' + deal['ID'] + '/';

                                                                    ($('<td title="' + result_value + '"></td>')
                                                                            .appendTo('#' + string)
                                                                            .append('<a href="' + deal_href + '" target="_blank"></a>')
                                                                    );

                                                                    if (valueOfEntity_option === "WORK_KPI") {

                                                                    }
                                                                    if (valueOfEntity_option === "EMPLOYEE_COMMISSION") {

                                                                    }
                                                                } else {
                                                                    let deal_href = 'https://' + arrayjson[7] + '/crm/deal/details/' + deal['ID'] + '/';
                                                                    result_value = value_validator(valueOfEntity_class, deal[valueOfEntity_option], valueOfEntity_option);

                                                                    ($('<td title="' + result_value + '"></td>')
                                                                            .appendTo('#' + string)
                                                                            .append('<a href="' + deal_href + '" target="_blank">' + result_value + '</a>')
                                                                    );

                                                                    entity_compare.push(deal);
                                                                }

                                                                break;
                                                            case "ACTIVITY":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );

                                                                activity_batch.forEach(activity => {
                                                                    if (String(activity['OWNER_ID']) === String(deal['ID'])) {
                                                                        result_value = value_validator(valueOfEntity_class, activity[valueOfEntity_option], valueOfEntity_option);

                                                                        ($('<tr></tr>')
                                                                                .appendTo('#' + string_intable)
                                                                                .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                        );
                                                                        entity_compare.push(activity);
                                                                    }
                                                                });
                                                                break;
                                                            case "OFFER":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );

                                                                offer_batch.forEach(offer => {
                                                                    if (String(offer['DEAL_ID']) === String(deal['ID'])) {
                                                                        result_value = value_validator(valueOfEntity_class, offer[valueOfEntity_option], valueOfEntity_option);

                                                                        ($('<tr></tr>')
                                                                                .appendTo('#' + string_intable)
                                                                                .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                        );
                                                                        entity_compare.push(offer);
                                                                    }
                                                                });
                                                                break;
                                                            case "CONTACT":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );

                                                                contact_batch.forEach(contact => {
                                                                    if (String(contact['ID']) === String(deal['CONTACT_ID'])) {
                                                                        result_value = value_validator(valueOfEntity_class, contact[valueOfEntity_option], valueOfEntity_option);

                                                                        ($('<tr></tr>')
                                                                                .appendTo('#' + string_intable)
                                                                                .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                        );
                                                                        entity_compare.push(contact);
                                                                    }
                                                                });
                                                                break;
                                                            case "LEAD":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );

                                                                lead_batch.forEach(lead => {
                                                                    if (String(lead['ID']) === String(deal['LEAD_ID'])) {
                                                                        result_value = value_validator(valueOfEntity_class, lead[valueOfEntity_option], valueOfEntity_option);

                                                                        ($('<tr></tr>')
                                                                                .appendTo('#' + string_intable)
                                                                                .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                        );
                                                                        entity_compare.push(lead);
                                                                    }
                                                                });
                                                                break;
                                                            case "INVOICE":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );

                                                                invoice_batch.forEach(invoice => {
                                                                    if (String(invoice['parentId2']) === String(deal['ID'])) {
                                                                        result_value = value_validator(valueOfEntity_class, invoice[valueOfEntity_option], valueOfEntity_option);

                                                                        ($('<tr></tr>')
                                                                                .appendTo('#' + string_intable)
                                                                                .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                        );
                                                                        entity_compare.push(invoice);
                                                                    }
                                                                });
                                                                break;
                                                            case "PRODUCT":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );
                                                                productrows = result.data();

                                                                productrows.forEach(productrow => {
                                                                    result_value = value_validator(valueOfEntity_class, productrow[valueOfEntity_option], valueOfEntity_option);

                                                                    ($('<tr></tr>')
                                                                            .appendTo('#' + string_intable)
                                                                            .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                    );
                                                                    entity_compare.push(productrow);
                                                                });
                                                                break;
                                                            case "COMPANY":
                                                                string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                ($('<td></td>')
                                                                        .appendTo('#' + string)
                                                                        .append($('<div id="into-table"></div>')
                                                                            .append($('<table id=' + string_intable + '></table>')))
                                                                );

                                                                company_batch.forEach(company => {
                                                                    if (String(company['ID']) === String(deal['COMPANY_ID'])) {
                                                                        result_value = value_validator(valueOfEntity_class, company[valueOfEntity_option], valueOfEntity_option);

                                                                        ($('<tr></tr>')
                                                                                .appendTo('#' + string_intable)
                                                                                .append($('<th title="' + result_value + '">' + result_value + '</th>'))
                                                                        );
                                                                        entity_compare.push(company);
                                                                    }
                                                                });
                                                                break;
                                                        }
                                                    });
                                                }

                                                if (deal_batch.indexOf(deal) === deal_batch.length - 1 && workers_choose.indexOf(worker_choose) === workers_choose.length - 1) {
                                                    loader.style.display = 'none';

                                                    selectedValues_choose.forEach(valueOfEntity => {
                                                        let valueOfEntity_substr = valueOfEntity.split('#');
                                                        let valueOfEntity_class = valueOfEntity_substr[0];
                                                        let valueOfEntity_option = valueOfEntity_substr[1];

                                                        switch (valueOfEntity_class) {
                                                            case "ACTIVITY":
                                                                activity_batch.forEach(activity => {
                                                                    if (entity_compare.includes(activity)) {
                                                                    } else {
                                                                        entity_date_begin = new Date(activity['CREATED']);
                                                                        entity_date_end = new Date(activity['CREATED']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (activity['AUTHOR_ID'] === worker_choose
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "ACTIVITY":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        result_value = value_validator(valueOfEntity_class, activity[valueOfEntity_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(activity);
                                                                                        break;

                                                                                    case "DEAL":
                                                                                    case "OFFER":
                                                                                    case "CONTACT":
                                                                                    case "LEAD":
                                                                                    case "INVOICE":
                                                                                    case "PRODUCT":
                                                                                    case "COMPANY":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                            case "OFFER":
                                                                offer_batch.forEach(offer => {
                                                                    if (entity_compare.includes(offer)) {
                                                                    } else {
                                                                        entity_date_begin = new Date(offer['DATE_CREATE']);
                                                                        entity_date_end = new Date(offer['CLOSEDATE']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (offer['CREATED_BY_ID'] === worker_choose
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "OFFER":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        result_value = value_validator(valueOfEntity_class, offer[valueOfEntity_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(offer);
                                                                                        break;
                                                                                    case "DEAL":
                                                                                    case "ACTIVITY":
                                                                                    case "CONTACT":
                                                                                    case "LEAD":
                                                                                    case "INVOICE":
                                                                                    case "PRODUCT":
                                                                                    case "COMPANY":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                            case "CONTACT":
                                                                contact_batch.forEach(contact => {
                                                                    if (entity_compare.includes(contact)) {
                                                                    } else {
                                                                        entity_date_begin = new Date(contact['DATE_CREATE']);
                                                                        entity_date_end = new Date(contact['DATE_CREATE']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (contact['CREATED_BY_ID'] === worker_choose
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "CONTACT":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        result_value = value_validator(valueOfEntity_class, contact[valueOfEntity_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(contact);
                                                                                        break;

                                                                                    case "DEAL":
                                                                                    case "ACTIVITY":
                                                                                    case "OFFER":
                                                                                    case "LEAD":
                                                                                    case "INVOICE":
                                                                                    case "PRODUCT":
                                                                                    case "COMPANY":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                            case "LEAD":
                                                                lead_batch.forEach(lead => {
                                                                    if (entity_compare.includes(lead)) {
                                                                    } else {
                                                                        // console.log(lead);

                                                                        entity_date_begin = new Date(lead['DATE_CREATE']);
                                                                        entity_date_end = new Date(lead['DATE_CREATE']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (lead['CREATED_BY_ID'] === worker_choose
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "LEAD":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        result_value = value_validator(valueOfEntity_class, lead[valueOfEntity_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(lead);
                                                                                        break;

                                                                                    case "DEAL":
                                                                                    case "ACTIVITY":
                                                                                    case "OFFER":
                                                                                    case "CONTACT":
                                                                                    case "INVOICE":
                                                                                    case "PRODUCT":
                                                                                    case "COMPANY":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                            case "INVOICE":
                                                                invoice_batch.forEach(invoice => {
                                                                    if (entity_compare.includes(invoice)) {
                                                                    } else {
                                                                        entity_date_begin = new Date(invoice['createdTime']);
                                                                        entity_date_end = new Date(invoice['closedate']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (toString(invoice['createdBy']) === toString(worker_choose)
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "INVOICE":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        result_value = value_validator(valueOfEntity_class, invoice[valueOfEntity_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(invoice);
                                                                                        break;

                                                                                    case "DEAL":
                                                                                    case "ACTIVITY":
                                                                                    case "OFFER":
                                                                                    case "CONTACT":
                                                                                    case "LEAD":
                                                                                    case "PRODUCT":
                                                                                    case "COMPANY":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                            case "PRODUCT":
                                                                product_batch.forEach(product => {
                                                                    if (entity_compare.includes(product)) {
                                                                    } else {
                                                                        entity_date_begin = new Date(product['DATE_CREATE']);
                                                                        entity_date_end = new Date(product['DATE_CREATE']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (product['CREATED_BY'] === worker_choose
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "PRODUCT":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        switch (valueOfEntity_option) {
                                                                                            case "PRODUCT_NAME":
                                                                                                except_option = "NAME";
                                                                                                break;
                                                                                            case "QUANTITY":
                                                                                                except_option = "";
                                                                                                break;
                                                                                            case "MEASURE_NAME":
                                                                                                except_option = "MEASURE";
                                                                                                break;
                                                                                            case "MEASURE_CODE":
                                                                                                except_option = "CODE";
                                                                                                break;
                                                                                            case "CUSTOM_PRICE":
                                                                                                except_option = "";
                                                                                                break;
                                                                                            case "DISCOUNT_TYPE_ID":
                                                                                                except_option = "";
                                                                                                break;
                                                                                            case "DISCOUNT_RATE":
                                                                                                except_option = "";
                                                                                                break;
                                                                                            case "DISCOUNT_SUM":
                                                                                                except_option = "PRICE";
                                                                                                break;
                                                                                            case "TAX_RATE":
                                                                                                except_option = "";
                                                                                                break;
                                                                                            case "TAX_INCLUDED":
                                                                                                except_option = "";
                                                                                                break;
                                                                                        }
                                                                                        result_value = value_validator(valueOfEntity_class, product[except_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(product);
                                                                                        break;

                                                                                    case "DEAL":
                                                                                    case "ACTIVITY":
                                                                                    case "OFFER":
                                                                                    case "CONTACT":
                                                                                    case "LEAD":
                                                                                    case "INVOICE":
                                                                                    case "COMPANY":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                            case "COMPANY":
                                                                company_batch.forEach(company => {
                                                                    if (entity_compare.includes(company)) {
                                                                    } else {
                                                                        entity_date_begin = new Date(company['DATE_CREATE']);
                                                                        entity_date_end = new Date(company['DATE_CREATE']);

                                                                        datebegin_choose = new Date(datebegin_choose);
                                                                        dateend_choose = new Date(dateend_choose);

                                                                        if (company['CREATED_BY_ID'] === worker_choose
                                                                            && entity_date_end >= datebegin_choose
                                                                            && entity_date_end <= dateend_choose) {
                                                                            counter++;
                                                                            string = 'table-main-tr' + counter;
                                                                            ($('<tr id=' + string + '></tr>')
                                                                                .appendTo('#table'));

                                                                            selectedValues_choose.forEach(valueOfEntity => {
                                                                                let valueOfEntity_substr = valueOfEntity.split('#');
                                                                                let valueOfEntity_class = valueOfEntity_substr[0];
                                                                                let valueOfEntity_option = valueOfEntity_substr[1];

                                                                                valueOfEntity_counter++;

                                                                                switch (valueOfEntity_class) {
                                                                                    case "WORKER":
                                                                                        try {
                                                                                            workers_batch.forEach(worker => {
                                                                                                if (worker['ID'] === worker_choose) {
                                                                                                    let worker_name = worker['NAME'] + " " + worker['LAST_NAME'];
                                                                                                    ($('<td>' + worker_name + '</td>')
                                                                                                        .appendTo('#' + string));

                                                                                                    throw new Error('value_found');
                                                                                                }
                                                                                            });
                                                                                        } catch (error) {
                                                                                            if (error.message !== 'value_found') {
                                                                                                throw error;
                                                                                            }
                                                                                        }
                                                                                        break;
                                                                                    case "COMPANY":
                                                                                        string_intable = 'table-main-tr' + String(counter) + String(valueOfEntity_counter);
                                                                                        ($('<td></td>')
                                                                                                .appendTo('#' + string)
                                                                                                .append($('<div id="into-table"></div>')
                                                                                                    .append($('<table id=' + string_intable + '></table>')))
                                                                                        );
                                                                                        result_value = value_validator(valueOfEntity_class, company[valueOfEntity_option], valueOfEntity_option);

                                                                                        ($('<tr></tr>')
                                                                                                .appendTo('#' + string_intable)
                                                                                                .append($('<th>' + result_value + '</th>'))
                                                                                        );
                                                                                        entity_compare.push(company);
                                                                                        break;

                                                                                    case "DEAL":
                                                                                    case "ACTIVITY":
                                                                                    case "OFFER":
                                                                                    case "CONTACT":
                                                                                    case "LEAD":
                                                                                    case "INVOICE":
                                                                                    case "PRODUCT":
                                                                                        ($('<td></td>')
                                                                                            .appendTo('#' + string));
                                                                                        break;

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                break;
                                                        }
                                                    });

                                                    $('#table th').click(function () {
                                                        var table = $(this).parents('table').eq(0);
                                                        var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
                                                        this.asc = !this.asc;
                                                        if (!this.asc) {
                                                            rows = rows.reverse()
                                                        }
                                                        for (var i = 0; i < rows.length; i++) {
                                                            table.append(rows[i])
                                                        }
                                                    })
                                                }
                                            });
                                        });
                                    }
                                );
                            })
                            .catch((error) => {
                                console.error('Ошибка:', error);
                            });
                    }
                });
            } else {
                alert('Отчет с таким названием уже существует!');
            }
        } else alert('Заполните все поля!');
    }
    static tableExport() {

    }

    static async createReport() {

        this.data = {
            type: "create report",
            portal: App.config.serverPath,
        };

        await request.AJAX(this.data, App.config);
        await List.init();
    }
    static async openReport(el) {

        let switcher = document.querySelector("#param-block-1-href");
        Menu.param_block_switcher(switcher);

        this.data = {
            type: "open report",
            portal: App.config.serverPath,
            click_name: el.id,
        };

        let response = await request.AJAX(this.data, App.config);
        await List.init();

        Menu.response = JSON.parse(response);
        Menu.arrayjson = JSON.parse(response[0]);
        Menu.arrayjson_open = JSON.parse(response[1]);

        Menu.entityes = arrayjson_open["entityes"];
        Menu.dateend = arrayjson_open["dateend"];
        Menu.datebegin = arrayjson_open["datebegin"];
        Menu.workers = arrayjson_open["workers"];
        Menu.reportName = arrayjson_open["reportName"];
        Menu.reportDescription = arrayjson_open["reportDescription"];
        Menu.main_reportName = arrayjson_open["reportName"];

        Menu.arrayjson = Object.values(arrayjson);
        Menu.arrayjson_open = Object.values(arrayjson_open);

        let sortable_entityes = document.querySelector("#sortable0");
        let ul = sortable_entityes.querySelector('ul');
        ul.innerHTML = "";
        Menu.entityes.forEach(entity => {
            let entity_substr = entity.split("#");

            let entity_class = entity_substr[0];
            let entity_option = entity_substr[1];
            let entity_name = entity_substr[2];

            let li = document.createElement('li');
            let input = document.createElement('input');

            input.checked = "True";
            input.style.margin = "0";
            input.style.padding = "0";
            input.style.position = "relative";
            input.type = "checkbox";
            input.value = entity;

            li.textContent = entity_name;

            ul.appendChild(li);
            li.appendChild(input);
        });

        const list_all = document.querySelectorAll('#sortable1 ul li');
        const list_main = document.querySelectorAll('#sortable0 ul li');

        list_main.forEach(function (listmain) {
            const main_checkbox = listmain.querySelector(':first-child');
            listmain.addEventListener('click', function () {
                main_checkbox.checked = !main_checkbox.checked;

                if (!main_checkbox.checked) {
                    var MainList = document.querySelectorAll('#sortable1 li');
                    for (var i = 0; i < MainList.length; i++) {
                        var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                        if (checkbox.value === main_checkbox.value) {
                            MainList[i].style.backgroundColor = "white";

                            checkbox.checked = false;
                            break;
                        }
                    }

                    listmain.remove();
                }

                $("#sortable0 input[type='checkbox']").each(function () {
                    Menu.selectedValues = [];

                    var MainList = document.querySelectorAll('#sortable0 li');
                    for (var i = 0; i < MainList.length; i++) {
                        var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                        checkbox.checked = true;
                        checkbox.disabled = false;

                        Menu.selectedValues.push(checkbox.value);
                    }
                });
                change_example_table();
            });
        });
        // добавляем EventListener на каждый чекбокс
        list_all.forEach(function (list) {
            const all_checkbox = list.querySelector(':first-child');

            list.style.backgroundColor = "white";
            all_checkbox.checked = false;
        });

        $(function () {
            $("#sortable0").sortable({
                connectWith: "#sortable0",
                items: "li", // указываем, что сортируемыми являются только элементы li
                stop: function (event, ui) {
                    $("#sortable0 input[type='checkbox']").each(function () {
                        Menu.selectedValues = [];

                        var MainList = document.querySelectorAll('#sortable0 li');
                        for (var i = 0; i < MainList.length; i++) {
                            var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                            checkbox.checked = true;
                            checkbox.disabled = false;

                            Menu.selectedValues.push(checkbox.value);
                            change_example_table();
                        }
                    });
                }
            }).disableSelection();

            $("input[type='checkbox']").draggable({
                helper: "clone",
                connectToSortable: ".sortable ul"
            }).disableSelection();
        });

        let report_name = document.querySelector("#report-name");
        let report_description = document.querySelector("#report-description");
        let datebegin_input = document.querySelector("#datebegin");
        let dateend_input = document.querySelector("#dateend");
        let workers_block = document.querySelector("#worker");

        report_name.value = reportName;
        report_description.value = reportDescription;
        datebegin_input.value = datebegin;
        dateend_input.value = dateend;
        workers_block.innerHTML = "";

        Menu.users.forEach(item => {
            // console.log(item);
            if (item['NAME'] === "" && item['LAST_NAME'] === "") {
                ($('<option id="' + item["ID"] + '" class="filterBox-worker-name" value="' + item["ID"] + '">' + item["EMAIL"] + '</option>')
                        .appendTo("#worker")
                );
            } else {
                ($('<option id="' + item["ID"] + '" class="filterBox-worker-name" value="' + item["ID"] + '">' + item["NAME"] + " " + item["LAST_NAME"] + '</option>')
                        .appendTo("#worker")
                );
            }
        });

        for (var i = 0; i < list_all.length; i++) {
            var checkbox = list_all[i].querySelector('input[type="checkbox"]');

            if (Menu.arrayjson_open[0].includes(checkbox.value)) checkbox.checked = true;
        }

        Menu.selectedValues = Object.values(arrayjson_open[0]);
        Menu.workers = Object.values(arrayjson_open[3]);

        Menu.workers.forEach(worker => {
            document.getElementById(worker).selected = true;
        });
        change_example_table();

        list_all.forEach(function (list) {
            const all_checkbox = list.querySelector(':first-child');
            if (all_checkbox.checked) list.style.backgroundColor = "#d0d0d0";
        });

        var startDateInput = document.getElementById('datebegin');
        var endDateInput = document.getElementById('dateend');

        flatpickr(startDateInput, {
            dateFormat: 'Y-m-d',
            onChange: function (selectedDates, dateStr, instance) {
                endDateInput.set('minDate', selectedDates[0]);
            }
        });
        endDateInput = flatpickr(endDateInput, {
            dateFormat: 'Y-m-d',
            onChange: function (selectedDates, dateStr, instance) {
                startDateInput.set('maxDate', selectedDates[0]);
            }
        });
    }
    static deleteReport(el) {

        this.data = {
            type: 'delete report',
            click_name: el.id,
            portal: App.config.serverPath,
        };

        el.parentNode.remove();
        request.AJAX(this.data, App.config);
    }
    static updateReportsList(reportName, date) {
        let list = document.querySelector(".reports-list-block");

        let item_block = document.createElement("div");
        item_block.id = "report-item-block";

        let item = document.createElement("div");
        item.className = "report-item";
        item.id = reportName;

        let a = document.createElement("a");
        a.href = "#report-param-block";
        a.className = 'report-item-href';

        let name = document.createElement("h5");
        name.textContent = reportName;
        name.className = 'report-item-name';

        let titledate = document.createElement("h5");
        titledate.textContent = date;
        titledate.className = 'report-item-date';

        let deleteitem = document.createElement("div");
        deleteitem.className = "report-item-delete";
        deleteitem.id = reportName;
        deleteitem.addEventListener("click", function () {
            deleteReport(this);
        });

        let img = document.createElement("img");
        img.src = 'src/bin.png';
        img.style.marginLeft = '5px';
        img.style.marginTop = '4px';
        img.style.width = '15px';
        img.style.height = '15px';

        list.appendChild(item_block);
        item_block.appendChild(item);
        item_block.appendChild(deleteitem);
        item.appendChild(a);
        a.appendChild(name);
        a.appendChild(titledate);
        deleteitem.appendChild(img);

        AddEventListenerForOptionsForChoose();

        const options = document.querySelectorAll('.report-item');

        options.forEach(option_bck => {
            if (option_bck.classList.contains('choosen-option')) {
                option_bck.classList.remove('choosen-option');
            }
        });
        item.classList.add('choosen-option');
    }
    static param_block_switcher(item) {

        let switchers = document.querySelectorAll(".param-block-switcher a");
        let block1 = document.querySelector("#param-block-1");
        let block2 = document.querySelector("#param-block-2");
        let block = document.getElementById(item.hash.substring(1));

        block1.style.display = "none";
        block2.style.display = "none";
        block.style.display = "block";

        switchers.forEach(el => {
            el.style.color = "#b0b0b0";
        });

        item.style.color = "#383838";
    }
    static change_example_table() {

        let values = document.querySelectorAll("#sortable0 ul li input");

        ($("#table-example tr")).remove();
        ($('<tr id="table-example-tr"></tr>').appendTo("#table-example"));

        values.forEach(valueOfEntity => {
            let valueOfEntity_name = (valueOfEntity['value'].split('#'))[2];

            ($('<th id="header-th-sortable">' + valueOfEntity_name + '</th>').appendTo($('#table-example-tr')));
        });
    }


    static async preproc() {

    }
    static init(value) {
        let block = document.querySelector("#report-param-block");
        let table = document.querySelector("#report-table-block");
        let create = document.querySelector("#report-param-panel-create");
        let table_export = document.querySelector("#report-table-export");

        block.style.display = "flex";
        table.style.display = "none";
        create.style.display = "block";
        create.dataset.writetype = "old";
        table_export.style.display = "none";

        entityes = 'null';
        datebegin = 'null';
        dateend = 'null';
        workers = [];
        reportName = 'null';
        reportDescription = 'null';
        click_name = 'null';
        selectedValues = 'null';
        main_reportName = 'null';
        selectedValues = [];
    }

    static initUI(){
        function formMenu(){

            // Настраиваем список отчетов
            let menu = document.querySelector(".reports-list-block");
            menu.innerHTML = "";

            for (let content in App.menuConfig){

                let reportName = content['reportName'];
                let date = content['date'];

                let itemBlock = document.createElement("div");
                itemBlock.id = "report-item-block";

                let item = document.createElement("div");
                item.className = "report-item";
                item.id = reportName;
                item.addEventListener("click", function (){
                    let options = document.querySelectorAll('.report-item');
                    options.forEach(option => {
                        if (option.classList.contains('choosen-option'))option.classList.remove('choosen-option');
                    });
                    this.classList.add('choosen-option');

                    Menu.init(this);
                });
                let a = document.createElement("a");
                a.classList = "report-item-href";
                a.href = "#report-param-block";

                let itemName = document.createElement("h5");
                itemName.classList = "report-item-name";
                itemName.textContent = reportName;

                let itemDate = document.createElement("h5");
                itemName.itemDate = "report-item-date";
                itemName.textContent = date;


                let itemDelete = document.createElement("div");
                itemDelete.id = reportName;
                itemDelete.classList = "report-item-delete";
                itemDelete.addEventListener("click", function (){
                    Menu.deleteReport(this);
                });

                let img = document.createElement("img");
                img.classList = "report-item-bin";

                a.appendChild(itemName);
                a.appendChild(itemDate);

                item.appendChild(a);

                itemDelete.appendChild(img);

                itemBlock.appendChild(item);
                itemBlock.appendChild(itemDelete);

                menu.appendChild(itemBlock);
            }

            // Настраиваем выборку полей для отчета
            const list_all = document.querySelectorAll('#sortable1 ul li');
            const list_main = document.querySelectorAll('#sortable0 ul li');

            list_main.forEach(function (listmain) {
                const main_checkbox = listmain.querySelector(':first-child');
                listmain.addEventListener('click', function (){
                    main_checkbox.checked = !main_checkbox.checked;

                    if (!main_checkbox.checked) {
                        var MainList = document.querySelectorAll('#sortable1 li');
                        for (var i = 0; i < MainList.length; i++) {
                            var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                            if (checkbox.value === main_checkbox.value){
                                MainList[i].style.backgroundColor = "white";

                                checkbox.checked = false;
                                break;
                            }
                        }

                        listmain.remove();
                    }

                    $("#sortable0 input[type='checkbox']").each(function() {
                        selectedValues = [];

                        var MainList = document.querySelectorAll('#sortable0 li');
                        for (var i = 0; i < MainList.length; i++) {
                            var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                            checkbox.checked = true;
                            checkbox.disabled = false;

                            selectedValues.push(checkbox.value);
                        }
                    });
                    change_example_table();
                });
            });
            // добавляем EventListener на каждый чекбокс
            list_all.forEach(function (list) {
                const all_checkbox = list.querySelector(':first-child');

                all_checkbox.checked = false;
                list.style.backgroundColor = "white";

                list.addEventListener('click', function (){
                    all_checkbox.checked = !all_checkbox.checked;
                    // если чекбокс отмечен, то дублируем его в другом списке

                    if (all_checkbox.checked){
                        list.style.backgroundColor = "#d0d0d0";

                        const duplicateLi = document.createElement('li');
                        const duplicateCheckbox = document.createElement('input');

                        duplicateCheckbox.type = 'checkbox';
                        duplicateCheckbox.checked = true;
                        duplicateCheckbox.value = all_checkbox.value;

                        // Переместить элемент checkbox перед текстом
                        duplicateLi.appendChild(duplicateCheckbox);
                        duplicateLi.appendChild(document.createTextNode(list.textContent));

                        document.querySelector('#sortable0 ul').appendChild(duplicateLi);

                        duplicateLi.addEventListener('click', function () {
                            duplicateCheckbox.checked = !duplicateCheckbox.checked;

                            // при нажатии на дублированный чекбокс удаляем его из списка
                            if (!duplicateCheckbox.checked) {
                                var MainList = document.querySelectorAll('#sortable1 li');
                                for (var i = 0; i < MainList.length; i++) {
                                    var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                                    if (checkbox.value === duplicateCheckbox.value){
                                        checkbox.checked = false;
                                        break;
                                    }
                                }

                                list.style.backgroundColor = "white";
                                duplicateLi.remove();
                            }

                            $("#sortable0 input[type='checkbox']").each(function() {
                                selectedValues = [];

                                var MainList = document.querySelectorAll('#sortable0 li');
                                for (var i = 0; i < MainList.length; i++) {
                                    var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                                    checkbox.checked = true;
                                    checkbox.disabled = false;

                                    selectedValues.push(checkbox.value);
                                }
                            });
                            change_example_table();
                        });
                    }
                    else{
                        list.style.backgroundColor = "white";

                        var MainList = document.querySelectorAll('#sortable0 li');
                        for (var i = 0; i < MainList.length; i++) {
                            var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                            if (checkbox.value === all_checkbox.value){
                                MainList[i].remove();
                                break;
                            }
                        }
                    }

                    $("#sortable0 input[type='checkbox']").each(function() {
                        selectedValues = [];

                        var MainList = document.querySelectorAll('#sortable0 li');
                        for (var i = 0; i < MainList.length; i++) {
                            var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                            checkbox.checked = true;
                            checkbox.disabled = false;

                            selectedValues.push(checkbox.value);
                        }
                    });
                    change_example_table();
                });
            });

            $(function() {
                $("#sortable0").sortable({
                    connectWith: "#sortable0",
                    items: "li", // указываем, что сортируемыми являются только элементы li
                    stop: function(event, ui) {
                        $("#sortable0 input[type='checkbox']").each(function() {
                            selectedValues = [];

                            var MainList = document.querySelectorAll('#sortable0 li');
                            for (var i = 0; i < MainList.length; i++) {
                                var checkbox = MainList[i].querySelector('input[type="checkbox"]');
                                checkbox.checked = true;
                                checkbox.disabled = false;

                                selectedValues.push(checkbox.value);
                                change_example_table();
                            }
                        });
                    }
                }).disableSelection();

                $("input[type='checkbox']").draggable({
                    helper: "clone",
                    connectToSortable: ".sortable ul"
                }).disableSelection();
            });
        }
        function formParamWindow(){

        }

        formMenu();
    }
}

$(document).ready(function() {
    App.init();
});