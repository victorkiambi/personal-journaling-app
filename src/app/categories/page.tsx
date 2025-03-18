import { CategoryList } from '@/components/categories/CategoryList';

export default function CategoriesPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your journal categories to organize your entries.
          </p>
        </div>
        <div className="mt-8">
          <CategoryList />
        </div>
      </div>
    </div>
  );
} 