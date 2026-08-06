import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { SocketModule } from './modules/socket/socket.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { GroupsModule } from './modules/groups/groups.module';
import { StudentsModule } from './modules/students/students.module';
import { ResultsModule } from './modules/results/results.module';
import { PostersModule } from './modules/posters/posters.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { PublicModule } from './modules/public/public.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongo_url'),
        retryAttempts: 5,
        retryDelay: 3000,
        lazyConnection: true,
        connectionFactory: (connection: any) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          connection.on('error', (err: any) => {
            console.error('❌ MongoDB connection error:', err.message);
          });
          return connection;
        },
      }),
    }),
    AuthModule,
    CloudinaryModule,
    SocketModule,
    CompetitionsModule,
    GroupsModule,
    StudentsModule,
    ResultsModule,
    PostersModule,
    GalleryModule,
    PublicModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
