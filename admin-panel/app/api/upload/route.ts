import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called'); // Debug

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    console.log('File received:', file?.name, file?.size); // Debug

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    // بررسی نوع فایل
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'فقط فایل‌های تصویری مجاز هستند' },
        { status: 400 }
      );
    }

    // بررسی اندازه فایل (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'حداکثر اندازه فایل 5 مگابایت است' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // اطمینان از وجود پوشه uploads
    const uploadsDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // ایجاد نام فایل یونیک
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    const filePath = join(uploadsDir, filename);

    console.log('Saving file to:', filePath); // Debug

    // ذخیره فایل
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    console.log('File saved successfully:', fileUrl); // Debug

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename
      }
    });
  } catch (error) {
    console.error('خطا در آپلود فایل:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در آپلود فایل' },
      { status: 500 }
    );
  }
}
