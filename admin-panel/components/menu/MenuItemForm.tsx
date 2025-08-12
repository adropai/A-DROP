import React, { useEffect } from 'react';
import { 
  ModalForm, 
  ProFormText, 
  ProFormTextArea, 
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  ProFormList,
  ProFormUploadDragger
} from '@ant-design/pro-components';
import { message, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { MenuItem, Category, MenuItemFormData, ApiResponse } from '@/types';

interface MenuItemFormProps {
  visible: boolean;
  editingItem: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  visible,
  editingItem,
  categories,
  onClose,
  onSuccess
}) => {
  // Handle image upload
  const handleImageUpload = async (file: any): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        return result.data.url;
      } else {
        message.error(result.message || 'خطا در آپلود تصویر');
        return '/placeholder-food.svg';
      }
    } catch (error) {
      message.error('خطا در آپلود تصویر');
      return '/placeholder-food.svg';
    }
  };
  // ذخیره آیتم منو
  const handleSubmit = async (values: MenuItemFormData) => {
    try {
      // Handle images - پردازش درست تصاویر
      let imageUrls: string[] = [];
      if (values.images && Array.isArray(values.images)) {
        // آپلود تصاویر جدید
        const uploadPromises = values.images.map(async (img: any) => {
          // اگر file object است (جدید آپلود شده)
          if (img.originFileObj) {
            return await handleImageUpload(img.originFileObj);
          }
          // اگر URL موجود است
          if (img.url) {
            return img.url;
          }
          // اگر response از آپلود داریم
          if (img.response?.url) {
            return img.response.url;
          }
          // در غیر این صورت نادیده بگیر
          return null;
        });
        
        const results = await Promise.all(uploadPromises);
        // فقط URL های معتبر را نگه دار
        imageUrls = results.filter(url => 
          url && 
          typeof url === 'string' && 
          url.startsWith('/') && 
          !url.includes('placeholder')
        ) as string[];
      }

      // Process ingredients and tags from ProFormList format
      const processedIngredients = values.ingredients?.map((item: any) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // ProFormList with name="ingredient" returns {ingredient: "value"}
          return item.ingredient || '';
        }
        return '';
      }).filter((item: string) => item && item.trim()) || [];

      const processedTags = values.tags?.map((item: any) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          // ProFormList with name="tag" returns {tag: "value"}
          return item.tag || '';
        }
        return '';
      }).filter((item: string) => item && item.trim()) || [];

      const formData = {
        ...values,
        price: Number(values.price),
        discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
        preparationTime: Number(values.preparationTime),
        calories: values.calories ? Number(values.calories) : undefined,
        priority: Number(values.priority || 0),
        images: JSON.stringify(imageUrls), // تبدیل آرایه URL ها به JSON string
        ingredients: JSON.stringify(processedIngredients), // تبدیل آرایه به JSON string
        tags: JSON.stringify(processedTags) // تبدیل آرایه به JSON string
      };

      console.log('📝 Form values before submission:', values);
      console.log('📝 Processed ingredients:', processedIngredients);
      console.log('📝 Processed tags:', processedTags);
      console.log('📝 Processed form data:', formData);

      const url = editingItem 
        ? `/api/menu/items/${editingItem.id}`
        : '/api/menu/items';
      
      const method = editingItem ? 'PUT' : 'POST';

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
          editingItem 
            ? 'آیتم منو با موفقیت ویرایش شد' 
            : 'آیتم منو با موفقیت ایجاد شد'
        );
        onSuccess();
        return true;
      } else {
        message.error(result.message || 'خطا در ذخیره آیتم منو');
        return false;
      }
    } catch (error) {
      message.error('خطا در ذخیره آیتم منو');
      return false;
    }
  };

  // تنظیم مقادیر اولیه فرم برای ویرایش
  const initialValues = editingItem ? {
    name: editingItem.name,
    nameEn: editingItem.nameEn,
    nameAr: editingItem.nameAr,
    description: editingItem.description,
    categoryId: editingItem.categoryId,
    price: editingItem.price,
    discountPrice: editingItem.discountPrice,
    preparationTime: editingItem.preparationTime,
    calories: editingItem.calories,
    isAvailable: editingItem.isAvailable,
    isSpecial: editingItem.isSpecial,
    priority: editingItem.priority,
    ingredients: (() => {
      try {
        const parsed = JSON.parse(editingItem.ingredients || '[]');
        if (Array.isArray(parsed)) {
          // Convert string array to ProFormList format with correct name
          return parsed.map((ingredient) => ({ ingredient: ingredient }));
        }
        return [];
      } catch (error) {
        return [];
      }
    })(),
    tags: (() => {
      try {
        const parsed = JSON.parse(editingItem.tags || '[]');
        if (Array.isArray(parsed)) {
          // Convert string array to ProFormList format with correct name
          return parsed.map((tag) => ({ tag: tag }));
        }
        return [];
      } catch (error) {
        return [];
      }
    })(),
    images: (() => {
      try {
        const parsedImages = JSON.parse(editingItem.images || '[]');
        return Array.isArray(parsedImages) ? parsedImages.map((url: string, index: number) => ({
          uid: `${index}`,
          name: `image-${index}`,
          status: 'done' as const,
          url: url
        })) : [];
      } catch (error) {
        return [];
      }
    })()
  } : {
    isAvailable: true,
    isSpecial: false,
    priority: 0,
    preparationTime: 15
  };

  return (
    <ModalForm
      title={editingItem ? 'ویرایش آیتم منو' : 'افزودن آیتم منو جدید'}
      open={visible}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      onFinish={handleSubmit}
      initialValues={initialValues}
      width={800}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      modalProps={{
        destroyOnHidden: true,
        okText: editingItem ? 'ویرایش' : 'ایجاد',
        cancelText: 'انصراف'
      }}
    >
      {/* اطلاعات اصلی */}
      <ProFormText
        name="name"
        label="نام فارسی"
        rules={[{ required: true, message: 'نام فارسی الزامی است' }]}
        placeholder="مثل: چلو کباب کوبیده"
      />
      
      <ProFormText
        name="nameEn"
        label="نام انگلیسی"
        placeholder="مثل: Chelo Kabab Koobideh"
      />
      
      <ProFormText
        name="nameAr"
        label="نام عربی"
        placeholder="مثل: تشيلو كباب كوبيده"
      />
      
      <ProFormTextArea
        name="description"
        label="توضیحات"
        placeholder="توضیحات تفصیلی آیتم منو"
        fieldProps={{
          rows: 3,
          maxLength: 500,
          showCount: true
        }}
      />

      {/* دسته‌بندی و قیمت */}
      <ProFormSelect
        name="categoryId"
        label="دسته‌بندی"
        rules={[{ required: true, message: 'انتخاب دسته‌بندی الزامی است' }]}
        options={categories.map(cat => ({
          label: cat.name,
          value: cat.id
        }))}
        placeholder="انتخاب دسته‌بندی"
        showSearch
        fieldProps={{
          filterOption: (input: any, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }}
      />

      <ProFormDigit
        name="price"
        label="قیمت (تومان)"
        rules={[{ required: true, message: 'قیمت الزامی است' }]}
        min={1000}
        max={10000000}
        fieldProps={{
          formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          parser: (value) => Number(value!.replace(/\$\s?|(,*)/g, '')),
        }}
      />

      <ProFormDigit
        name="discountPrice"
        label="قیمت تخفیف (تومان)"
        min={1000}
        max={10000000}
        fieldProps={{
          formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          parser: (value) => Number(value!.replace(/\$\s?|(,*)/g, '')),
        }}
      />

      {/* آپلود تصاویر */}
      <ProFormUploadDragger
        name="images"
        label="تصاویر آیتم منو"
        title="کلیک کنید یا تصاویر را اینجا بکشید"
        description="فرمت‌های مجاز: JPG, PNG, GIF - حداکثر 3 تصویر"
        max={3}
        fieldProps={{
          name: 'file',
          multiple: true,
          listType: 'picture-card',
          beforeUpload: (file) => {
            // بررسی نوع فایل
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
              message.error('فقط فایل‌های تصویری مجاز هستند!');
              return false;
            }
            // بررسی اندازه فایل
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error('حداکثر اندازه فایل 5 مگابایت است!');
              return false;
            }
            return false; // جلوگیری از آپلود خودکار
          },
          accept: 'image/*',
          onChange: ({ fileList }) => {
            // پردازش تصاویر آپلود شده
            return fileList.map((file: any) => {
              if (file.originFileObj && !file.url) {
                // Create preview URL for new files
                file.url = URL.createObjectURL(file.originFileObj);
              }
              return file;
            });
          }
        }}
      />

      {/* مواد اولیه و برچسب‌ها */}
      <ProFormList
        name="ingredients"
        label="مواد اولیه"
        copyIconProps={false}
        creatorButtonProps={{
          creatorButtonText: 'افزودن ماده اولیه'
        }}
        tooltip="مواد اولیه‌ای که در تهیه این آیتم استفاده می‌شود"
      >
        <ProFormText name="ingredient" placeholder="مثل: گوشت گوساله، برنج، پیاز" />
      </ProFormList>

      <ProFormList
        name="tags"
        label="برچسب‌ها"
        copyIconProps={false}
        creatorButtonProps={{
          creatorButtonText: 'افزودن برچسب'
        }}
        tooltip="برچسب‌هایی برای دسته‌بندی بهتر آیتم"
      >
        <ProFormText name="tag" placeholder="مثل: حلال، گیاهی، تند، محبوب" />
      </ProFormList>

      {/* اطلاعات آشپزخانه */}
      <ProFormDigit
        name="preparationTime"
        label="زمان آماده‌سازی (دقیقه)"
        rules={[{ required: true, message: 'زمان آماده‌سازی الزامی است' }]}
        min={1}
        max={120}
      />

      <ProFormDigit
        name="calories"
        label="کالری"
        min={1}
        max={5000}
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
        name="isAvailable"
        label="در دسترس"
        checkedChildren="موجود"
        unCheckedChildren="ناموجود"
      />

      <ProFormSwitch
        name="isSpecial"
        label="آیتم ویژه"
        checkedChildren="ویژه"
        unCheckedChildren="عادی"
      />
    </ModalForm>
  );
};

export default MenuItemForm;
