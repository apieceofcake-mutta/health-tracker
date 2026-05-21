// sw.js - Service Worker
// バージョンを変えるたびにキャッシュが自動更新されます
const CACHE_NAME = 'health-log-v3';
const ASSETS = [
  './',
  './index.html',
];

// インストール時：キャッシュに保存
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // 即座に有効化
});

// 有効化時：古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 全タブに即適用
});

// フェッチ時：Network First戦略
// → まずネットワークから取得（最新版を優先）
// → オフライン時はキャッシュにフォールバック
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 取得成功したらキャッシュも更新
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
