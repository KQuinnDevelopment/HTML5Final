<?php
	// I know this is wrong... oh well...
	$s = "";
	$u = "";
	$p = "";
	$db = "comments";
	
	// searching db for matches
	$key = $_REQUEST['address'];
	$out;
	
	$connect = new PDO("mysql:host=$s;dbname=$db",$u,$p);
	$connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	try {
		$send = $connect->prepare("SELECT * FROM Comments WHERE Comments[ADDRESS] = :address")->fetchAll();
		$send->bind_param(":address", $key);
		$out = $send->execute();
		
		json_encode($out);
	} catch(PDOException $e) {
		$out = "-1";
	}
	
	$connect->close();
	
	echo $out;
?>