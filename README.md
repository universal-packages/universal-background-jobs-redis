# Background Jobs Redis

[![npm version](https://badge.fury.io/js/@universal-packages%2Fbackground-jobs-redis.svg)](https://www.npmjs.com/package/@universal-packages/background-jobs-redis)
[![Testing](https://github.com/universal-packages/universal-background-jobs-redis/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-background-jobs-redis/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-background-jobs-redis/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-background-jobs-redis)

Redis queue for [universal-background-jobs](https://github.com/universal-packages/universal-background-jobs).

## Install

```shell
npm install @universal-packages/background-jobs-redis

npm install @universal-packages/background-jobs
```

## RedisQueue

Just pass this engine to the Jobs and Worker instances to enable it to use redis as the queue system.

```js
import { BackgroundJobs } from '@universal-packages/universal-background-jobs'
import { RedisQueue } from '@universal-packages/universal-background-jobs-redis'

const backgroundJobs = new BackgroundJobs({ queue: 'redis', queueOptions: { host: 'localhost' } })

await backgroundJobs.prepare()
```

### Options

`RedisQueue` takes the same [options](https://github.com/universal-packages/universal-redis-queue#options) as the redis queue standalone interface.

Additionally takes the following ones:

- **`globalClient`** `String`
  If the redis client lives in a global variable, name it here.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
