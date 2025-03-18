'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";


interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCategoryId 
        ? `/api/categories/${editingCategoryId}` 
        : '/api/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingCategoryId ? 'update' : 'create'} category`);
      }

      toast.success(`Category ${editingCategoryId ? 'updated' : 'created'} successfully`);
      setName('');
      setColor('#4F46E5');
      setEditingCategoryId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setName(category.name);
    setColor(category.color);
    setEditingCategoryId(category.id);
  };

  const handleDelete = async (id: string) => {
    setDeletingCategoryId(id);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleCancelEdit = () => {
    setName('');
    setColor('#4F46E5');
    setEditingCategoryId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 mb-8">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="color">Category Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 p-1"
                />
                <div 
                  className="h-10 w-10 rounded-md border"
                  style={{ backgroundColor: color }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCategoryId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingCategoryId ? 'Update' : 'Create'} Category
                  </>
                )}
              </Button>
              
              {editingCategoryId && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Your Categories</h3>
            
            {categories.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No categories yet. Create your first category above.
              </div>
            ) : (
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-lg border"
                  >
                    <div className="flex items-center">
                      <div 
                        className="h-8 w-8 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                              This will delete the category "{category.name}". This action cannot be undone.
                              If this category is used in journal entries, they will be unlinked from this category.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button>Cancel</Button>
                            <Button
                              onClick={() => handleDelete(category.id)}
                              disabled={deletingCategoryId === category.id}
                            >
                              {deletingCategoryId === category.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 