import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { SessionsModule } from './sessions/sessions.module';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationModule } from './notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    TasksModule,
    CategoriesModule,
    SessionsModule,
    ChatModule,
    FriendsModule,
    NotificationModule,
  ],
})
export class AppModule {}
