import { DataSource } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';

const options: SeederOptions = {
  seeds: ['dist/seeds/*{.ts,.js}'],
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres1',
  password: '123456',
  database: 'postgres1',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false, // ❌ KHÔNG bật khi dùng migration
  ...options,
});
