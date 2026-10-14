import * as migration_20261011_103550_initial_schema from './20261011_103550_initial_schema';
import * as migration_20261011_110000_row_level_security from './20261011_110000_row_level_security';
import * as migration_20261011_183854_storage_object_keys from './20261011_183854_storage_object_keys';
import * as migration_20261014_223638_home_ticker from './20261014_223638_home_ticker';

export const migrations = [
  {
    up: migration_20261011_103550_initial_schema.up,
    down: migration_20261011_103550_initial_schema.down,
    name: '20261011_103550_initial_schema',
  },
  {
    up: migration_20261011_110000_row_level_security.up,
    down: migration_20261011_110000_row_level_security.down,
    name: '20261011_110000_row_level_security',
  },
  {
    up: migration_20261011_183854_storage_object_keys.up,
    down: migration_20261011_183854_storage_object_keys.down,
    name: '20261011_183854_storage_object_keys',
  },
  {
    up: migration_20261014_223638_home_ticker.up,
    down: migration_20261014_223638_home_ticker.down,
    name: '20261014_223638_home_ticker'
  },
];
