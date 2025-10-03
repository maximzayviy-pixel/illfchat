import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById, hashPassword, verifyPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const user = getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const avatarFile = formData.get('avatar') as File;

    // Обновляем данные пользователя
    user.username = username || user.username;
    user.email = email || user.email;

    // Если есть новый пароль, проверяем текущий
    if (newPassword && currentPassword) {
      // В реальном приложении здесь была бы проверка текущего пароля
      // const isValidPassword = await verifyPassword(currentPassword, user.password);
      // if (!isValidPassword) {
      //   return NextResponse.json(
      //     { error: 'Неверный текущий пароль' },
      //     { status: 400 }
      //   );
      // }
      
      // Обновляем пароль
      // user.password = await hashPassword(newPassword);
    }

    // Обработка аватара (в реальном приложении загружали бы в облако)
    if (avatarFile && avatarFile.size > 0) {
      // Здесь была бы загрузка файла
      user.avatar = `/avatars/${user.id}.jpg`;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
