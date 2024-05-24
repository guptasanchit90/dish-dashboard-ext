node -p "JSON.stringify({...require('./manifest.json'), version: '0.0.2'}, null, 2)" > manifest.json

zip -r dish-dashboard-ext.zip . -x '*/node_modules/*' -x '.git/*' -x '*.log' -x '*.tmp' -x '*.yml' -x '.*' -x '*
.md' -x '*.sh'