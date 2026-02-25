<?php
header("Access-Control-Allow-Origin: *");
file_put_contents('scores.json', '[]');
echo "Reset done";
?>
