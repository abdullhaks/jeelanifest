import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthModule } from './auth.module';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.schema';
import mongoose from 'mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  
  const mockAdminId = new mongoose.Types.ObjectId();
  const mockAdmin = {
    _id: mockAdminId,
    username: 'jeelanifestadmin',
    password: 'hashed_password', // will be stubbed
  };

  const mockAdminModel = {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAdmin) }),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeAll(async () => {
    mockAdmin.password = await bcrypt.hash('admin123', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env', // Make sure it loads JWT secrets
        }),
        AuthModule,
      ],
    })
    .overrideProvider(getModelToken(Admin.name))
    .useValue(mockAdminModel)
    .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let validRefreshToken: string;
  let validAccessToken: string;

  it('/auth/login (POST) - returns access token and sets refresh cookie', async () => {
    mockAdminModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockAdmin)
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'jeelanifestadmin',
        password: 'admin123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('admin');
    
    validAccessToken = response.body.accessToken;

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    
    const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    
    // Extract token from cookie for next tests
    validRefreshToken = refreshCookie.split(';')[0].split('=')[1];
  });

  it('/auth/protected-test (GET) - rejects without access token', async () => {
    await request(app.getHttpServer())
      .get('/auth/protected-test')
      .expect(401);
  });

  it('/auth/protected-test (GET) - accepts valid access token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/protected-test')
      .set('Authorization', `Bearer ${validAccessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'You have access!');
    expect(response.body.admin).toHaveProperty('username', 'jeelanifestadmin');
  });

  it('/auth/refresh (POST) - rotates access token using cookie', async () => {
    mockAdminModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockAdmin)
    });

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', [`refreshToken=${validRefreshToken}`])
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).toBeDefined();
  });
});
