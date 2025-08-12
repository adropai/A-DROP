import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/customers/[id] - دریافت اطلاعات مشتری مشخص
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔹 GET /api/customers/[id] called with ID:', params.id);
    
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        addresses: true,
        preferences: true,
        stats: true,
        tags: true
      }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    console.log('🔹 Customer found:', { id: customer.id, name: customer.name });

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات مشتری' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - ویرایش اطلاعات مشتری
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔹 PUT /api/customers/[id] called with ID:', params.id);
    
    const body = await request.json();
    console.log('🔹 Update data received:', body);
    
    const { 
      name, 
      email, 
      phone, 
      dateOfBirth, 
      gender, 
      tier, 
      status,
      avatar,
      tags = []
    } = body;

    // بررسی وجود مشتری
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی تکراری نبودن ایمیل (اگر ایمیل تغییر کرده)
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findFirst({
        where: { 
          email: email,
          id: { not: params.id }
        }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'این ایمیل قبلاً ثبت شده است' },
          { status: 400 }
        );
      }
    }

    // بررسی تکراری نبودن شماره تلفن (اگر شماره تغییر کرده)
    if (phone && phone !== existingCustomer.phone) {
      const phoneExists = await prisma.customer.findFirst({
        where: { 
          phone: phone,
          id: { not: params.id }
        }
      });
      
      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: 'این شماره تلفن قبلاً ثبت شده است' },
          { status: 400 }
        );
      }
    }

    // بروزرسانی مشتری
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone && { phone }),
        ...(avatar !== undefined && { avatar: avatar || null }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth || null }),
        ...(gender !== undefined && { gender: gender || null }),
        ...(tier && { tier }),
        ...(status && { status }),
        updatedAt: new Date(),
        tags: {
          deleteMany: {},
          create: (tags || []).map((tagName: string) => ({
            name: tagName,
          })),
        },
      },
      include: {
        addresses: true,
        preferences: true,
        stats: true,
        tags: true
      }
    });

    // تبدیل tags به array از strings
    const customerWithTags = {
      ...updatedCustomer,
      tags: updatedCustomer.tags.map(tag => tag.name),
    };

    console.log('🔹 Customer updated successfully:', { id: customerWithTags.id, name: customerWithTags.name });

    return NextResponse.json({
      success: true,
      data: customerWithTags,
      message: 'اطلاعات مشتری با موفقیت بروزرسانی شد',
    });
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش اطلاعات مشتری' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - حذف مشتری
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔹 DELETE /api/customers/[id] called with ID:', params.id);
    
    // بررسی وجود مشتری
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // حذف مشتری (کاسکید حذف related data ها)
    await prisma.customer.delete({
      where: { id: params.id }
    });

    console.log('🔹 Customer deleted successfully:', { id: params.id, name: existingCustomer.name });

    return NextResponse.json({
      success: true,
      message: 'مشتری با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف مشتری' },
      { status: 500 }
    );
  }
}
