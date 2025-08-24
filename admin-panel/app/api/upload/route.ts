import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called'); // Debug

    const data = await request.formData();
    const files = data.getAll('images') as File[]; // Multiple files support

    console.log('Files received:', files.length); // Debug

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      // بررسی نوع فایل
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        continue;
      }

      // بررسی اندازه فایل (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // اطمینان از وجود پوشه uploads/menu
      const uploadsDir = join(process.cwd(), 'public/uploads/menu');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // ایجاد نام فایل یونیک
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}_${randomSuffix}.${extension}`;
      const filePath = join(uploadsDir, filename);

      console.log('Saving file to:', filePath); // Debug

      // ذخیره فایل
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/menu/${filename}`;
      console.log('File saved successfully:', fileUrl); // Debug

      uploadedFiles.push(fileUrl);
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'هیچ فایل معتبری آپلود نشد' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} فایل آپلود شد`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('خطا در آپلود فایل:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در آپلود فایل' },
      { status: 500 }
    );
  }
}
