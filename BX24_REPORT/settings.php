<?php
define('C_REST_CLIENT_ID','local.647a7733238676.54690738');//Application ID
define('C_REST_CLIENT_SECRET','P0xV11NxGuaTjCzGWBnvaEsLpMcDK0SzE8jt45sLw7ebczSVhd');//Application key
// or
//define('C_REST_WEB_HOOK_URL','https://rest-api.bitrix24.com/rest/1/doutwqkjxgc3mgc1/');//url on creat Webhook

//define('C_REST_CURRENT_ENCODING','windows-1251');
//define('C_REST_IGNORE_SSL',true);//turn off validate ssl by curl
//define('C_REST_LOG_TYPE_DUMP',true); //logs save var_export for viewing convenience
define('C_REST_BLOCK_LOG', false);//turn off default logs
//define('C_REST_LOGS_DIR', __DIR__ .'/logs/'); //directory path to save the log

define('SERVER_PATH', $_REQUEST["DOMAIN"]);
define('SERVER_HOST', explode(':', $_SERVER['HTTP_HOST'])[0]);
define('APP_NAME', "local_otchet");

