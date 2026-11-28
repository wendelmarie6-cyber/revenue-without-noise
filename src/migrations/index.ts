import * as migration_20261128_105115_baseline from './20261128_105115_baseline';
import * as migration_20261128_105500_drop_template_leftovers from './20261128_105500_drop_template_leftovers';
import * as migration_20261128_105834_media_storage_fields from './20261128_105834_media_storage_fields';

export const migrations = [
  {
    up: migration_20261128_105115_baseline.up,
    down: migration_20261128_105115_baseline.down,
    name: '20261128_105115_baseline'
  },
  {
    up: migration_20261128_105500_drop_template_leftovers.up,
    down: migration_20261128_105500_drop_template_leftovers.down,
    name: '20261128_105500_drop_template_leftovers'
  },
  {
    up: migration_20261128_105834_media_storage_fields.up,
    down: migration_20261128_105834_media_storage_fields.down,
    name: '20261128_105834_media_storage_fields'
  },
];
