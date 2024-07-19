<?php
require_once(__DIR__ . '/settings.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>BX24 REPORTS</title>

    <script src="https://api.bitrix24.com/api/v1/"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.js" type="text/javascript"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="style/style.css">

    <script src="script/index.js" type="module" data-name="<?=APP_NAME;?>" data-path="<?=SERVER_PATH;?>" data-host="<?=SERVER_HOST;?>"></script>
</head>
<body>
    <header>
        <div class="block-local-img">
            <a href="https://artsolution24.ru/" target="_blank"><img src="src/logo_UTV7cTym.png" style="height: 65px; width: 250px;"></a>
        </div>
        <div class="header-button" style="display: none;" id="report-param-panel-create" data-writetype="new" onclick="showReport()">
            <text>Сформировать отчет</text>
        </div>
        <div class="header-button" style="display: none;" id="report-table-export" onclick="tableExport()">
            <text>Экспортировать отчет</text>
        </div>
    </header>
    <main>
        <div id="report-panel" class="report-panel-list box">
            <div class="reports-list-block"></div>
            <div class="header-button" id="report-plus" onclick="createReport()">Создать отчет</div>
        </div>
        <div id="report-panel" class="report-panel-param box">
            <div id="report-param-block">
                <div class="param-block-switcher">
                    <a href="#param-block-1" id="param-block-1-href" onclick="param_block_switcher(this)">Имя отчета</a>
                    <a href="#param-block-2" id="param-block-2-href" onclick="param_block_switcher(this)">Поля таблицы</a>
                </div>
                <div class="param-block-inner-float">
                    <div class="param-block-1" id="param-block-1">
                        <div class="param-block-main" id="report-name-block">
                            <div class="param-block-1-row">
                                <div class="param-block-1-container">
                                    <text>Название отчета</text>
                                    <textarea id="report-name"></textarea>
                                </div>
                                <div class="param-block-1-container">
                                    <text>Описания отчета</text>
                                    <textarea id="report-description" style="height: 100px"></textarea>
                                </div>
                            </div>
                            <div class="param-block-1-row">
                                <div class="param-block-1-container">
                                    <text>Период отчета</text>
                                    <label for="datebegin" style="font-size: 1em; margin-right: 2px;">Начало:</label>
                                    <input type="date" name="calendar" value="" max="2099-12-30" min="2012-01-1" style="margin-right: 15px; width: 77px;" id="datebegin"">
                                    <label for="dateend" style="font-size: 1em; margin-right: 2px;">Конец:</label>
                                    <input type="date" name="calendar" value="" max="2099-12-30" min="2012-01-1" style="margin-right: 10px; width: 77px;" id="dateend"">
                                </div>
                                <div class="param-block-1-container">
                                    <text>Сотрудники</text>
                                    <select class="workers-select" id="worker" multiple></select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="param-block-2" id="param-block-2">
                        <div class="param-block-main choose-entity-block">
                            <div>
                                <div id="sortable-entityes">
                                    <div id="sortable0" class="sortable">
                                        <text style="width: 100%;">Отметьте сущности</text>
                                        <ul></ul>
                                    </div>
                                    <div id="sortable1-group">
                                        <div id="sortable1" class="sortable sort-deal">
                                                <div id="sortable-text"><text>Сделки</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#TITLE#Название сделки">Название сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="WORKER#WORKER#Сотрудник">Сотрудник</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#STAGE_ID#Статус сделки">Статус сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#OPPORTUNITY#Сумма сделки">Сумма сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#DATE_CREATE#Дата создания сделки">Дата создания сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#CLOSEDATE#Дата закрытия сделки">Дата закрытия сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#WORK_KPI#Проделаная работа">Проделаная работа</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#EMPLOYEE_COMMISSION#Комиссия сотрудника">Комиссия сотрудника</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#ADDITIONAL_INFO#Дополнительная информация сделки">Дополнительная информация сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#COMMENTS#Коментарии сделки">Коментарии сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#CLOSED#Активность сделки">Активность сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#DATE_MODIFY#Дата изменения сделки">Дата изменения сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#IS_RETURN_CUSTOMER#Признак повторного лида сделки">Признак повторного лида сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#OPENED#Доступна сделка для всех">Доступна сделка для всех</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#SOURCE_DESCRIPTION#Дополнительно об источнике сделки">Дополнительно об источнике сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#TAX_VALUE#Ставка налога сделки">Ставка налога сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#UTM_CAMPAIGN#Обозначение рекламной кампании сделки">Обозначение рекламной кампании сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#UTM_MEDIUM#Тип трафика сделки">Тип трафика сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#UTM_SOURCE#Рекламная система сделки">Рекламная система сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="DEAL#UTM_TERM#Условие поиска кампании сделки">Условие поиска кампании сделки</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-activity">
                                                <div id="sortable-text"><text>Дела</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#DEADLINE#Сроки имполнения дела">Сроки имполнения дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#DESCRIPTION#Описание дела">Описание дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#DIRECTION#Направление дела">Направление дела: входящее/исходящее</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#END_TIME#Время завершения дела">Время завершения дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#LAST_UPDATED#Дата последнего обновления дела">Дата последнего обновления дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#NOTIFY_TYPE#Тип уведомлений дела">Тип уведомлений дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#START_TIME#Время начала выполнения дела">Время начала выполнения дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#STATUS#Статус дела">Статус дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#SUBJECT#Субьект дела">Субьект дела</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="ACTIVITY#TYPE_ID#Тип дела">Тип дела</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-offer">
                                                <div id="sortable-text"><text>Предложения</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#BEGINDATE#Дата выставления предложения">Дата выставления предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CLIENT_TITLE#Предложение: Название клиента">Предложение: Название клиента</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CLIENT_TPA_ID#Предложение: КПП клиента">Предложение: КПП клиента</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CLIENT_TP_ID#Предложение: ИНН клиента">Предложение: ИНН клиента</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CLOSED#Предложение завершено">Предложение завершено</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CLOSEDATE#Дата завершения предложения">Дата завершения предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#COMMENTS#Комментарий менеджера по предложению">Комментарий менеджера по предложению</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CONTENT#Содержание предложения">Содержание предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#CURRENCY_ID#Валюта предложения">Валюта предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#DATE_CREATE#Дата создания предложения">Дата создания предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#DATE_MODIFY#Дата изменения предложения">Дата изменения предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#OPENED#Доступно предложение для всех">Доступно предложение для всех</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#QUOTE_NUMBER#Номер предложения">Номер предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#STATUS_ID#Статус предложения">Статус предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#TAX_VALUE#Сумма предложения">Сумма предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#TERMS#Условия предложения">Условия предложения</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="OFFER#TITLE#Название предложения">Название предложения</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-contact">
                                                <div id="sortable-text"><text>Контакты</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#NAME#Имя контакта">Имя контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#LAST_NAME#Фамилия контакта">Фамилия контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#SECOND_NAME#Отчество контакта">Отчество контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#ADDRESS#Адрес контакта">Адрес контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#BIRTHDATE#Дата рождения контакта">Дата рождения контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#COMMENTS#Комментарии контакта">Комментарии контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#DATE_CREATE#Дата создания контакта">Дата создания контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#DATE_MODIFY#Дата изменения контакта">Дата изменения контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#EXPORT#Участвует ли контакт в экспорте">Участвует ли контакт в экспорте</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#HONORIFIC#Вид обращения контакта">Вид обращения контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#OPENED#Доступен контакт для всех">Доступен контакт для всех</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#POST#Должность контакта">Должность контакта</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="CONTACT#SOURCE_DESCRIPTION#Описание источника контакта">Описание источника контакта</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-lead">
                                                <div id="sortable-text"><text>Лиды</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#TITLE#Название лида">Название лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#OPPORTUNITY#Предполагаемая сумма лида">Предполагаемая сумма лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#NAME#Имя лида">Имя лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#LAST_NAME#Фамилия лида">Фамилия лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#SECOND_NAME#Отчество лида">Отчество лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#POST#Должность лида">Должность лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#DATE_CLOSED#Дата закрытия лида">Дата закрытия лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#DATE_CREATE#Дата создания лида">Дата создания лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#DATE_MODIFY#Дата изменения лида">Дата изменения лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#HONORIFIC#Вид обращения лида">Вид обращения лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#MOVED_TIME#Дата перемещения лида на текущую стадию">Дата перемещения лида на текущую стадию</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#OPENED#Доступен лида для всех">Доступен лида для всех</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#SOURCE_DESCRIPTION#Описание источника лида">Описание источника лида</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="LEAD#STATUS_ID#Статус лида">Статус лида</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-invoice">
                                                <div id="sortable-text"><text>Счета</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#title#Название счет">Название счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#opportunity#Счет">Счет</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#createdTime#Дата создания счета">Дата создания счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#updatedTime#Дата обновления счета">Дата обновления счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#movedTime#Дата продвижения счета">Дата продвижения счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#categoryId#Категория счета">Категория счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#opened#Открыт счет">Открыт счет</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#begindate#Дата выставления счета">Дата выставления счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#closedate#Дата закрытия счета">Дата закрытия счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#taxValue#Налог счета">Налог счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#sourceDescription#Описание счета">Описание счета</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#comments#Комментарии к счету">Комментарии к счету</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="INVOICE#lastActivityTime#Дата последней активности счета">Дата последней активности счета</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-product">
                                                <div id="sortable-text"><text>Товары</text></div>
                                                <ul  id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#PRODUCT_NAME#название продукта или услуги, который был добавлен к сделке">название продукта или услуги, который был добавлен к сделке</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#PRICE#цена продукта или услуги, которые были добавлены к сделке">цена продукта или услуги, которые были добавлены к сделке</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#QUANTITY#количество продукта или услуги, которые были добавлены к сделке">количество продукта или услуги, которые были добавлены к сделке</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#MEASURE_NAME#название единицы измерения продукта или услуги">название единицы измерения продукта или услуги</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#MEASURE_CODE#код единицы измерения продукта или услуги">код единицы измерения продукта или услуги</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#CUSTOM_PRICE#флаг, указывающий, установлена ли пользовательская цена для данной товарной позиции">флаг, указывающий, установлена ли пользовательская цена для данной товарной позиции</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#SORT#порядковый номер товарной позиции в списке">порядковый номер товарной позиции в списке</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#DISCOUNT_TYPE_ID#тип скидки для данной товарной позиции">тип скидки для данной товарной позиции</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#DISCOUNT_RATE#размер скидки для данной товарной позиции в процентах">размер скидки для данной товарной позиции в процентах</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#DISCOUNT_SUM#размер скидки для данной товарной позиции в валюте сделки">размер скидки для данной товарной позиции в валюте сделки</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#TAX_RATE#ставка налога для данной товарной позиции в процентах">ставка налога для данной товарной позиции в процентах</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="PRODUCT#TAX_INCLUDED#флаг, указывающий, включен ли налог в цену товарной позиции">флаг, указывающий, включен ли налог в цену товарной позиции</li>
                                                </ul>
                                            </div>
                                        <div id="sortable1" class="sortable sort-company">
                                                <div id="sortable-text"><text>Компании</text></div>
                                                <ul id="entityes">
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#TITLE#Название компании">Название компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#ADDRESS#Адрес компании">Адрес компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#BANKING_DETAILS#Банковские реквизиты">Банковские реквизиты</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#COMMENTS#Комментарии компании">Комментарии компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#COMPANY_TYPE#Тип компании">Тип компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#CURRENCY_ID#Валюта компании">Валюта компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#DATE_CREATE#Дата создания компании">Дата создания компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#DATE_MODIFY#Дата изменения компании">Дата изменения компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#EMPLOYEES#Количество сотрудников компании">Количество сотрудников компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#INDUSTRY#Сфера деятельности компании">Сфера деятельности компании</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#OPENED#Компания доступна для всех">Компания доступна для всех</li>
                                                    <li><input style="margin: 0; padding: 0; position: relative" type="checkbox" value="COMPANY#REVENUE#Годовой оборот компании">Годовой оборот компании</li>
                                                </ul>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="report-table-example-block">
                            <table id="table-example">
                                <tr></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div id="report-table-block">
                <div id="table-div">
                    <table id="table"></table>
                </div>
            </div>
            <div class="loader-container">
                <div class="loader-point-bar">
                    <span id="loader-point-bar-inner"></span>
                </div>
                <div class="loader"></div>
            </div>
        </div>
    </main>
</body>
</html>