<?php
class Back {
	static function load() {
		if (isset($_REQUEST['lf'])) {
			echo self::listFiles();
		}
	}
	static function listFiles() {
		$root = dirname(__FILE__) . "/../codes/";
		$result = glob($root . "*.logo");
		$result = array_map(function ($n) use ($root) {
			return substr($n, strlen($root), -5);
		}, $result);
		return json_encode($result);
	}
}
Back::load();
