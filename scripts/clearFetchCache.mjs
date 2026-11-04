import { rmSync } from 'node:fs';

rmSync('.next/cache/fetch-cache', { recursive: true, force: true });
