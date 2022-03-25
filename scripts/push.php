<?php
	// I know this is wrong... oh well...
	$s = "";
	$u = "";
	$p = "";
	$db = "comments";
	
	// form inputs
	$name = htmlspecialchars($_REQUEST['name']);
	$comm = htmlspecialchars($_REQUEST['comment']);
	$addr = $_REQUEST['address'];
	$out = "-1";
	
	$tempOut = preg_match("/^([^[:punct:]\d]+)$/", $name);
	if (($tempOut == 1) && (strlen($comm) > 0)) {
		$out = 0;
		
		try {
			$connect = new PDO("mysql:host=$s;dbname=$db",$u,$p);
			$connect->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			
			$send = $connect->prepare("INSERT INTO Comments (ADDRESS, USERNAME, DATEMADE, COMMENT, VISIBLE) 
			VALUES (:address,:username,:date,:commentVal,:isVisible)");
			$send->bind_param(":address", $addr);
			$send->bind_param(":username", $name);
			$send->bind_param(":date", $comm);
			$send->bind_param(":commentVal", date("Y-m-d"));
			$send->bind_param(":isVisible", true);
			$send->execute();
		} catch(PDOException $e) {
			$out = "-1";
		}
		$connect->close();
	} else {
		if (strlen($comm) > 0) {
			$out = 1;
		} else {
			$out = 2;
		}
	}
	
	echo $out; // if this works I'll feel heckin' smart
?>