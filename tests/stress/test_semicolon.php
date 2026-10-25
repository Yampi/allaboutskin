<?php
require 'backend/vendor/autoload.php';
$parser = new \App\Domain\Cosmetics\Services\InciParserService();
$tokens = $parser->tokenize('Aqua; Glycerin; Niacinamide');
echo 'SEMICOLON SPLIT COUNT: ' . count($tokens) . ' (First token: ' . $tokens[0] . ")\n";
