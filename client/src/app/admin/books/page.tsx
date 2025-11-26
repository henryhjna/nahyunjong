'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import type { Book, BookForm } from '@/lib/types';

const initialForm: BookForm = {
  title: '',
  subtitle: '',
  authors: '',
  publisher: '',
  published_date: '',
  isbn: '',
  cover_image_url: '',
  description: '',
  table_of_contents: '',
  purchase_url: '',
  is_published: true,
  order_index: 0
};

export default function AdminBooksPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BookForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchBooks();
    }
  }, [isAdmin]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/admin/all`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/books/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/books`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          published_date: form.published_date || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save book');
      }

      await fetchBooks();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book: Book) => {
    setForm({
      title: book.title,
      subtitle: book.subtitle || '',
      authors: book.authors,
      publisher: book.publisher || '',
      published_date: book.published_date ? book.published_date.split('T')[0] : '',
      isbn: book.isbn || '',
      cover_image_url: book.cover_image_url || '',
      description: book.description || '',
      table_of_contents: book.table_of_contents || '',
      purchase_url: book.purchase_url || '',
      is_published: book.is_published,
      order_index: book.order_index
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete book');
      await fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const togglePublish = async (book: Book) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${book.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_published: !book.is_published })
      });

      if (!response.ok) throw new Error('Failed to update book');
      await fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-accent-blue hover:text-accent-cyan text-sm mb-2 inline-block transition-colors">
              ← Admin Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Books Management</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm sm:text-base whitespace-nowrap"
          >
            + 새 도서 추가
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-xl text-status-error">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">닫기</button>
          </div>
        )}

        {showForm && (
          <div className="mb-8 glass-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {editingId ? '도서 수정' : '새 도서 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="도서 제목"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    부제목
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="부제목 (선택)"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    저자 *
                  </label>
                  <input
                    type="text"
                    value={form.authors}
                    onChange={(e) => setForm({ ...form, authors: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="나현종"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    출판사
                  </label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="출판사명"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    출간일
                  </label>
                  <input
                    type="date"
                    value={form.published_date}
                    onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="978-89-..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    표시 순서
                  </label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <ImageUpload
                category="books"
                currentUrl={form.cover_image_url}
                onUpload={(url) => setForm({ ...form, cover_image_url: url })}
                onDelete={() => setForm({ ...form, cover_image_url: '' })}
                label="표지 이미지"
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  구매 링크
                </label>
                <input
                  type="url"
                  value={form.purchase_url}
                  onChange={(e) => setForm({ ...form, purchase_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  책 소개
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                  placeholder="책 소개 내용"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  목차
                </label>
                <textarea
                  value={form.table_of_contents}
                  onChange={(e) => setForm({ ...form, table_of_contents: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                  placeholder="1장. 서론&#10;2장. 본론&#10;..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-accent-blue focus:ring-accent-blue"
                />
                <label htmlFor="is_published" className="ml-2 text-sm text-text-secondary">
                  바로 공개
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-hover transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {submitting ? '저장 중...' : (editingId ? '수정' : '추가')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  도서
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  저자
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-24 whitespace-nowrap">
                  출간일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-20 whitespace-nowrap">
                  상태
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider w-24 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                    등록된 도서가 없습니다.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary line-clamp-1">
                        {book.title}
                      </div>
                      {book.subtitle && (
                        <div className="text-sm text-text-secondary line-clamp-1">
                          {book.subtitle}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {book.authors}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(book.published_date)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(book)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          book.is_published
                            ? 'bg-status-success/10 text-status-success'
                            : 'bg-surface-hover text-text-tertiary'
                        }`}
                      >
                        {book.is_published ? '공개' : '비공개'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="text-accent-blue hover:text-accent-cyan font-medium transition-colors whitespace-nowrap"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-status-error hover:text-status-error/80 font-medium transition-colors whitespace-nowrap"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
