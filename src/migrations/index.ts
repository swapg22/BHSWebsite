import * as migration_20261011_103550_initial_schema from './20261011_103550_initial_schema';
import * as migration_20261011_110000_row_level_security from './20261011_110000_row_level_security';
import * as migration_20261011_183854_storage_object_keys from './20261011_183854_storage_object_keys';
import * as migration_20261014_223638_home_ticker from './20261014_223638_home_ticker';
import * as migration_20261021_161927_header_banners from './20261021_161927_header_banners';
import * as migration_20261021_205838_page_cards from './20261021_205838_page_cards';

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
    name: '20261014_223638_home_ticker',
  },
  {
    up: migration_20261021_161927_header_banners.up,
    down: migration_20261021_161927_header_banners.down,
    name: '20261021_161927_header_banners',
  },
  {
    up: migration_20261021_205838_page_cards.up,
    down: migration_20261021_205838_page_cards.down,
    name: '20261021_205838_page_cards'
  },
];
