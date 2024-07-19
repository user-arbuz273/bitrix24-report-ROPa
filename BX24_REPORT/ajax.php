<?php
require_once (__DIR__.'/crestcurrent.php');

switch ($_POST['type'])
{
    case "delete report":
        $dir = __DIR__ . '/tmp/' . $_POST['portal'] . '/';
        if(!file_exists($dir)){mkdir($dir, 0777, true);}

        $content = file_get_contents($dir . 'reports' . '.json');
        $arrayjson = json_decode($content, true);

        foreach($arrayjson as $key => $content){
            if (isset($content) && $content["reportName"] === $_POST["click_name"]){
                unset($arrayjson[$key]);

                break;
            }
        }

        if ($arrayjson === null){
            file_put_contents($dir . 'reports' . '.json', json_encode(new stdClass(), JSON_FORCE_OBJECT));
        }
        else{
            file_put_contents($dir . 'reports' . '.json', json_encode($arrayjson, JSON_FORCE_OBJECT));
        }
        echo "success";

        break;
    case "ajax to write":
        switch ($_POST['writetype']){
            case "new":
                $SERVER_PATH = $_POST['portal'];
                $dir = __DIR__ .  '/tmp/' . $SERVER_PATH . '/';

                $content = file_get_contents($dir . 'reports' . '.json');
                $arrayjson = json_decode($content, true);

                $arrayjson[] = $_POST;

                file_put_contents($dir . 'reports' . '.json', json_encode($arrayjson, JSON_FORCE_OBJECT));

                break;
            case "old":
                $SERVER_PATH = $_POST['portal'];
                $dir = __DIR__ .  '/tmp/' . $SERVER_PATH . '/';
                
                $content = file_get_contents($dir . 'reports' . '.json');
                $arrayjson = json_decode($content, true);

                foreach($arrayjson as $key => $content){
                    if ($content["reportName"] === $_POST["mainName"]){
                        unset($arrayjson[$key]);
                        break;
                    }
                }
                $arrayjson[] = $_POST;

                file_put_contents($dir . 'reports' . '.json', json_encode($arrayjson, JSON_FORCE_OBJECT));

                break;
        }
        break;
    case "open report":

        $click_name = $_POST['click_name'];
        $dir = __DIR__ .  '/tmp/' . $_POST['portal'] . '/';

        $content = file_get_contents($dir . 'reports' . '.json');

        $arrayjson = json_decode($content, true);

        foreach ($arrayjson as $content)
        {
            if ($click_name == $content["reportName"]) {

                $entityes = $content["entityes"];
                $dateend = $content["dateend"];
                $datebegin = $content["datebegin"];
                $workers = $content["workers"];
                $reportName = $content["reportName"];
                $reportDescription = $content["reportDescription"];

                $merged_json = array(
                    0 => json_encode($arrayjson),
                    1 => json_encode($content)
                );

                echo json_encode($merged_json);

                break;
            }
        }
        break;
    case "create report":

        $dir = __DIR__ .  '/tmp/' . $_POST['portal'] . '/';

        $content = file_get_contents($dir . 'reports' . '.json');

        $arrayjson = json_decode($content, true);

        echo json_encode($arrayjson);

        break;

    case "write to json":

        $name = $_POST['name'];
        $index = $_POST['index'];
        $path = $_POST['portal'];

        $result = json_encode(array(
            "name" => $name,
            "index" => $index
        ), JSON_FORCE_OBJECT);

        $result = file_put_contents(__DIR__."/tmp/".$path."/".$name.".json", $result, true);

        echo $result;

        break;
    case "get from json":

        $name = $_POST['name'];
        $path = $_POST['portal'];

        $result = file_get_contents(__DIR__."/tmp/".$path."/".$name.".json");
        $result = json_decode($result, true);
        $result = $result['index'];

        echo $result;

        break;
    case "get data from transit values":

        $name = $_POST['name'];
        $path = $_POST['portal'];

        $result = file_get_contents(__DIR__."/tmp/".$path."/transitconf/".$name);
        $result = json_decode($result, true);

        echo json_encode($result, JSON_FORCE_OBJECT);;

        break;
    case "get rest app code":

        $path = $_POST['portal'];

        $result = file_get_contents(__DIR__."/tmp/".$path."/"."appcode".".json");
        $result = json_decode($result, true);
        $result = $result['code'];

        echo $result;

        break;
    case "write rest app code":

        $path = $_POST['portal'];
        $code = $_POST['code'];

        $result = file_put_contents(__DIR__."/tmp/".$path."/"."appcode".".json", json_encode($code, JSON_FORCE_OBJECT), true);

        echo $result;

        break;
    case "get app code":

        $path = $_POST['portal'];

        $result = file_get_contents(__DIR__."/tmp/".$path."/"."settings".".json");
        $result = json_decode($result, true);
        $result = $result['code'];

        echo $result;

        break;
    case "save grand for workers":

        $path = $_POST['portal'];
        $workers = $_POST['workers'];

        $result = file_put_contents(__DIR__."/tmp/".$path."/"."grandworkers".".json", $workers, true);

        echo $result;

        break;
    case "load grand for workers":

        $path = $_POST['portal'];

        $result = file_get_contents(__DIR__."/tmp/".$path."/"."grandworkers".".json");

        echo $result;

        break;
    case "save menu data json":
        $result = $_POST['data'];

        $result = file_put_contents(__DIR__."/tmp/".$_POST['path']."/menu.json", json_encode($result, JSON_PRETTY_PRINT), true);

        echo $result;
        break;
    case "load menu data json":
        if (file_exists(__DIR__."/tmp/".$_POST['path']."/menu.json")){
            $result = file_get_contents(__DIR__."/tmp/".$_POST['path']."/menu.json");
        } else {
            $result = "error";
        }

        echo $result;
        break;
}

?>