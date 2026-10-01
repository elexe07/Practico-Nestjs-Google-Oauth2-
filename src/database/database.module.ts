import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE', 'postgres');

        if (dbType === 'sqlite' || dbType === 'sqljs') {
          return {
            type: 'sqljs',
            autoSave: true,
            location: configService.get<string>('DB_DATABASE', 'oauth_db.sqlite'),
            entities: [User],
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get<number>('DB_PORT', 5432)),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: String(configService.get<string>('DB_PASSWORD', 'root')),
          database: configService.get<string>('DB_DATABASE', 'oauth_db'),
          entities: [User],
          synchronize: true, // TODO: poner en false cuando se pase a produccion
        };
      },
    }),
  ],
})
export class DatabaseModule {}