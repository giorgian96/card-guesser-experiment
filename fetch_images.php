<?php
// Used to get the images from wikimedia
// If needed run from command line: php fetch_images.php

$params = [
    'action'    => 'query',
    'generator' => 'categorymembers',
    'gcmtitle'  => 'Category:Public_domain_playing_cards',
    'gcmtype'   => 'file',
    'gcmlimit'  => 60,
    'prop'      => 'imageinfo',
    'iiprop'    => 'url|mime',
    'format'    => 'json',
];

$url = 'https://commons.wikimedia.org/w/api.php?' . http_build_query($params);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FAILONERROR    => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_USERAGENT      => 'PlayingCardsFetcher/0.0 ([use_your_own_email])', // set your own email address here
]);

$body = curl_exec($ch);
if ($body === false) {
    echo 'Request failed: ' . curl_error($ch) . PHP_EOL;
    exit(1);
}

$data = json_decode($body, true, flags: JSON_THROW_ON_ERROR);

$dir = __DIR__ . '/playing cards';
if (!is_dir($dir) && !mkdir($dir, 0777, true)) {
    echo 'Could not create directory: ' . $dir . PHP_EOL;
    exit(1);
}
    
foreach ($data['query']['pages'] ?? [] as $page) {
    $info = $page['imageinfo'][0] ?? null;
    if ($info !== null && $info['mime'] === 'image/svg+xml') {
        $urlPath = parse_url($info['url'], PHP_URL_PATH);
        $path = $dir . '/' . rawurldecode(basename($urlPath));
        if (!file_exists($path)) {
            usleep(500_000); // some delay to not get blocked by their API
            if (download_image($info['url'], $path)) {
                echo 'Saved ' . $path . PHP_EOL;
            }
        }
    }
}

function download_image(string $url, string $path): bool
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FAILONERROR    => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_USERAGENT      => 'PlayingCardsFetcher/0.0 ([use_your_own_email])', // set your own email address here
    ]);

    $content = curl_exec($ch);
    if ($content === false) {
        echo 'Failed: ' . $url . ' (' . curl_error($ch) . ')' . PHP_EOL;
        return false;
    }

    if (file_put_contents($path, $content) === false) {
        echo 'Could not write: ' . $path . PHP_EOL;
        return false;
    }

    return true;
}