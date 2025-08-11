import React from 'react';
import { 
  ModalForm, 
  ProFormText, 
  ProFormTextArea, 
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  ProFormUploadButton
} from '@ant-design/pro-components';
import { message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Category, CategoryFormData, ApiResponse } from '@/types';

interface CategoryFormProps {
  visible: boolean;
  editingCategory: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  visible,
  editingCategory,
  categories,
  onClose,
  onSuccess
}) => {
  // ذخیره دسته‌بندی
  const handleSubmit = async (values: CategoryFormData) => {
    try {
      const formData = {
        ...values,
        priority: Number(values.priority || 0),
        // parentId را درست تنظیم می‌کنیم
        parentId: values.parentId || null,
        // فعلاً image را نادیده می‌گیریم تا مشکل اصلی حل شود
        image: undefined
      };

      const url = editingCategory 
        ? `/api/menu/categories/${editingCategory.id}`
        : '/api/menu/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        message.success(
          editingCategory 
            ? 'دسته‌بندی با موفقیت ویرایش شد' 
            : 'دسته‌بندی با موفقیت ایجاد شد'
        );
        onSuccess();
        return true;
      } else {
        message.error(result.message || 'خطا در ذخیره دسته‌بندی');
        return false;
      }
    } catch (error) {
      message.error('خطا در ارتباط با سرور');
      return false;
    }
  };

  // تنظیم مقادیر اولیه فرم برای ویرایش
  const initialValues = editingCategory ? {
    name: editingCategory.name,
    nameEn: editingCategory.nameEn,
    nameAr: editingCategory.nameAr,
    description: editingCategory.description,
    parentId: editingCategory.parentId,
    priority: editingCategory.priority,
    isActive: editingCategory.isActive
  } : {
    isActive: true,
    priority: 0
  };

  // فیلتر کردن دسته‌بندی‌هایی که می‌توانند والد باشند
  const availableParents = categories.filter(cat => 
    cat.id !== editingCategory?.id && // خودش نمی‌تواند والد خودش باشد
    cat.parentId !== editingCategory?.id // فرزندانش نمی‌توانند والدش باشند
  );

  return (
    <ModalForm
      title={editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
      open={visible}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      onFinish={handleSubmit}
      initialValues={initialValues}
      width={600}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      modalProps={{
        destroyOnHidden: true,
        okText: editingCategory ? 'ویرایش' : 'ایجاد',
        cancelText: 'انصراف'
      }}
    >
      {/* اطلاعات اصلی */}
      <ProFormText
        name="name"
        label="نام فارسی"
        rules={[{ required: true, message: 'نام فارسی الزامی است' }]}
        placeholder="مثل: کباب و جوجه"
      />
      
      <ProFormText
        name="nameEn"
        label="نام انگلیسی"
        placeholder="مثل: Kabab & Chicken"
      />
      
      <ProFormText
        name="nameAr"
        label="نام عربی"
        placeholder="مثل: کباب ودجاج"
      />
      
      <ProFormTextArea
        name="description"
        label="توضیحات"
        placeholder="توضیحات تفصیلی دسته‌بندی"
        fieldProps={{
          rows: 3,
          maxLength: 300,
          showCount: true
        }}
      />

      {/* دسته‌بندی والد */}
      <ProFormSelect
        name="parentId"
        label="دسته‌بندی والد"
        options={[
          { label: 'بدون والد (دسته‌بندی اصلی)', value: null },
          ...availableParents.map(cat => ({
            label: cat.name,
            value: cat.id
          }))
        ]}
        placeholder="انتخاب دسته‌بندی والد (اختیاری)"
        showSearch
        fieldProps={{
          filterOption: (input: any, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }}
      />

      {/* تصویر دسته‌بندی */}
      <ProFormUploadButton
        name="image"
        label="تصویر دسته‌بندی"
        max={1}
        fieldProps={{
          name: 'file',
          listType: 'picture',
          beforeUpload: () => false, // جلوگیری از آپلود خودکار
          accept: 'image/*'
        }}
        icon={<UploadOutlined />}
        title="انتخاب تصویر"
      />

      {/* تنظیمات */}
      <ProFormDigit
        name="priority"
        label="اولویت نمایش"
        min={0}
        max={100}
        tooltip="عدد بالاتر = اولویت بیشتر"
      />

      <ProFormSwitch
        name="isActive"
        label="فعال"
        checkedChildren="فعال"
        unCheckedChildren="غیرفعال"
      />
    </ModalForm>
  );
};

export default CategoryForm;
