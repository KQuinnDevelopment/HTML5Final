<?php
	// I know this is wrong... oh well...
	$s = "";
	$u = "";
	$p = "";
	$db = "comments";
	
	$out = "-1";
	$v = $_REQUEST['key'];
	
	$connect = new PDO("mysql:host=$s;dbname=$db",$u,$p);
	$connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	try {
		$send = $connect->prepare("SELECT Comments[VISIBLE] FROM Comments WHERE Comments[ID] = :id");
		$send->bind_param(":id", $v);
		$boolValue = $send->execute();
		
		$boolValue != $boolValue;
		
		$send = $connect->("UPDATE Comments SET Comments[VISIBLE] = :b WHERE Comments[ID] = :id");
		$send->bind_param(":b", $boolValue);
		$send->bind_param(":id", $v);
		$send->execute();
		
		$out = "0";
	} catch(PDOException $e) {
		$out = "-1";
	}
	$connect->close();
	
	echo $out;
?>