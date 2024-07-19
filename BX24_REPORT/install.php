<?php
require_once (__DIR__.'/crest.php');
require_once(__DIR__ . '/settings.php');

$dir = __DIR__ .  '/tmp/' . SERVER_PATH . '/';
$result = CRest::installApp();

echo $dir;

if($result['rest_only'] === false):?>
	<head>
		<script src="//api.bitrix24.com/api/v1/"></script>
		<?php if($result['install'] === true):?>
			<script>
				BX24.init(function(){
                    console.log("Auth: ", BX24.getAuth());
					BX24.installFinish();
				});
			</script>
		<?php endif;?>
	</head>
	<body>
		<?php if($result['install'] === true):?>
			installation has been finished
		<?php else:?>
			installation error
            <? var_export($result); ?>
		<?php endif;?>
	</body>
<?php endif;
