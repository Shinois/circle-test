# values are mongo driver presets but allow you to manipulate them
# https://mongodb.github.io/node-mongodb-native/2.0/reference/connecting/connection-settings/
MONGODB_POOL_SIZE=10
MONGODB_CONNECT_TIMEOUT=0
MONGODB_SOCKET_TIMEOUT=0
MONGODB_KEEEP_ALIVE=0
MONGO_URL=mongodb://dialonce-dev:LBZDtvs4Qy9G8j5BTfv2g43LSHZ93DB8@mongodb1.dialonce.live:27017,mongodb2.dialonce.live:27017,mongodb3.dialonce.live:27017/dialonce?replicaSet=Mongo-Rs-DialOnce
MONGO_DB=dialonce

LOGSTASH_HOST=logstash.dialonce.io
LOGSTASH_PORT=5000

BUGS_TOKEN=138e0e6ebe529f8f2eb9d0abba44a9f3
BUGSNAG_RELEASE_STAGES=production,staging

AMQP_URL=amqp://admin:secretpassword@rabbitmq-svc.dialonce.live

LOCAL_QUEUE=:ci

DEFAULT_OFFSET=0
DEFAULT_LIMIT=0
