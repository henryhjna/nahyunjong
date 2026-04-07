'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { Thought, ThoughtForm, ThoughtAttachment } from '@/lib/types';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

const initialForm: ThoughtForm = {
  title: '',
  title_en: '',
  slug: '',
  excerpt: '',
  excerpt_en: '',
  content: '',
  content_en: '',
  category: '',
  category_en: '',
  subcategory: '',
  subcategory_en: '',
  cover_image_url: '',
  prev_id: null,
  next_id: null,
  is_published: false,
  published_at: new Date().toISOString().split('T')[0],
};

export default function AdminThoughtsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ThoughtForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<ThoughtAttachment[]>([]);
  const [newAttachment, setNewAttachment] = useState({ type: 'link' as 'link' | 'file', url: '', title: '', title_en: '' });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/login');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) fetchThoughts();
  }, [isAdmin]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  const fetchThoughts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/admin/all`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setThoughts(await res.json());
    } catch (error) {
      console.error('Failed to fetch thoughts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/thoughts`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          slug: form.slug || generateSlug(form.title),
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(initialForm);
        fetchThoughts();
      }
    } catch (error) {
      console.error('Failed to save thought:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (thought: Thought) => {
    setForm({
      title: thought.title,
      title_en: thought.title_en || '',
      slug: thought.slug,
      excerpt: thought.excerpt || '',
      excerpt_en: thought.excerpt_en || '',
      content: thought.content || '',
      content_en: thought.content_en || '',
      category: thought.category || '',
      category_en: thought.category_en || '',
      subcategory: thought.subcategory || '',
      subcategory_en: thought.subcategory_en || '',
      cover_image_url: thought.cover_image_url || '',
      prev_id: thought.prev_id || null,
      next_id: thought.next_id || null,
      is_published: thought.is_published,
      published_at: thought.published_at ? thought.published_at.split('T')[0] : '',
    });
    setEditingId(thought.id);
    setShowForm(true);
    fetchAttachments(thought.id);
  };

  const fetchAttachments = async (thoughtId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/${thoughtId}/attachments`, { headers: getAuthHeaders() });
      if (res.ok) setAttachments(await res.json());
    } catch {}
  };

  const addAttachment = async () => {
    if (!editingId || !newAttachment.url) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/${editingId}/attachments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAttachment),
      });
      if (res.ok) {
        setNewAttachment({ type: 'link', url: '', title: '', title_en: '' });
        fetchAttachments(editingId);
      }
    } catch {}
  };

  const deleteAttachment = async (attachmentId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok && editingId) fetchAttachments(editingId);
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thoughts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) fetchThoughts();
    } catch (error) {
      console.error('Failed to delete thought:', error);
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary mb-2 inline-block">← 대시보드</Link>
            <h1 className="text-3xl font-bold text-text-primary">생각 관리</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(initialForm); }}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            새 글 작성
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl bg-surface border border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">제목 (한국어) *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title (English)</label>
                <input
                  type="text"
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="자동 생성"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">발행일</label>
                <input
                  type="date"
                  value={form.published_at}
                  onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">대분류</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="연재, 에세이, 칼럼..."
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">대분류 영문</label>
                <input
                  type="text"
                  value={form.category_en}
                  onChange={(e) => setForm({ ...form, category_en: e.target.value })}
                  placeholder="Series, Essay, Column..."
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">중분류 (시리즈명)</label>
                <input
                  type="text"
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  placeholder="AI시대, 대학교육은 어디로 가나"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">중분류 영문</label>
                <input
                  type="text"
                  value={form.subcategory_en}
                  onChange={(e) => setForm({ ...form, subcategory_en: e.target.value })}
                  placeholder="AI Era: Where is University Education Going?"
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">요약 (한국어)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Excerpt (English)</label>
                <textarea
                  value={form.excerpt_en}
                  onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })}
                  rows={2}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">본문 (한국어)</label>
              <TiptapEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="본문을 작성하세요..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Content (English)</label>
              <TiptapEditor
                content={form.content_en}
                onChange={(html) => setForm({ ...form, content_en: html })}
                placeholder="Write your content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">커버 이미지 URL</label>
              <input
                type="text"
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                className="input-field w-full"
              />
            </div>

            {/* Attachments (only visible when editing an existing thought) */}
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">첨부파일 / 링크</label>

                {/* Existing attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover text-sm">
                        <span className="px-2 py-0.5 rounded text-xs bg-accent-blue/10 text-accent-blue">
                          {att.type === 'file' ? '파일' : '링크'}
                        </span>
                        <span className="flex-1 truncate text-text-primary">{att.title || att.url}</span>
                        {att.title_en && <span className="text-text-tertiary truncate">{att.title_en}</span>}
                        <button
                          type="button"
                          onClick={() => deleteAttachment(att.id)}
                          className="text-status-error hover:text-status-error/80 text-xs flex-shrink-0"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new attachment */}
                <div className="flex flex-wrap gap-2 items-end">
                  <select
                    value={newAttachment.type}
                    onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value as 'link' | 'file' })}
                    className="input-field w-24"
                  >
                    <option value="link">링크</option>
                    <option value="file">파일</option>
                  </select>
                  <input
                    type="text"
                    value={newAttachment.url}
                    onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                    placeholder="URL"
                    className="input-field flex-1 min-w-[200px]"
                  />
                  <input
                    type="text"
                    value={newAttachment.title}
                    onChange={(e) => setNewAttachment({ ...newAttachment, title: e.target.value })}
                    placeholder="제목"
                    className="input-field w-36"
                  />
                  <input
                    type="text"
                    value={newAttachment.title_en}
                    onChange={(e) => setNewAttachment({ ...newAttachment, title_en: e.target.value })}
                    placeholder="Title (EN)"
                    className="input-field w-36"
                  />
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 text-sm"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}

            {/* Prev/Next linking (optional, for series) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">이전 글 (선택)</label>
                <select
                  value={form.prev_id ?? ''}
                  onChange={(e) => setForm({ ...form, prev_id: e.target.value ? Number(e.target.value) : null })}
                  className="input-field w-full"
                >
                  <option value="">없음</option>
                  {thoughts.filter((t) => t.id !== editingId).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">다음 글 (선택)</label>
                <select
                  value={form.next_id ?? ''}
                  onChange={(e) => setForm({ ...form, next_id: e.target.value ? Number(e.target.value) : null })}
                  className="input-field w-full"
                >
                  <option value="">없음</option>
                  {thoughts.filter((t) => t.id !== editingId).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-text-secondary">공개</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
              >
                {submitting ? '저장 중...' : editingId ? '수정' : '작성'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); setForm(initialForm); }}
                className="px-6 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <p className="text-text-secondary">로딩 중...</p>
        ) : thoughts.length === 0 ? (
          <p className="text-text-secondary">등록된 글이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {thoughts.map((thought) => (
              <div key={thought.id} className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${thought.is_published ? 'bg-status-success/20 text-status-success' : 'bg-surface-hover text-text-tertiary'}`}>
                      {thought.is_published ? '공개' : '비공개'}
                    </span>
                    {thought.category && (
                      <span className="px-2 py-0.5 rounded text-xs bg-accent-blue/10 text-accent-blue">{thought.category}</span>
                    )}
                    {thought.subcategory && (
                      <span className="px-2 py-0.5 rounded text-xs bg-surface-hover text-text-tertiary">{thought.subcategory}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary truncate">{thought.title}</h3>
                  {thought.title_en && <p className="text-sm text-text-tertiary truncate">{thought.title_en}</p>}
                  <p className="text-xs text-text-tertiary mt-1">
                    {thought.published_at ? new Date(thought.published_at).toLocaleDateString('ko-KR') : '발행일 미정'}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(thought)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-hover transition-colors">수정</button>
                  <button onClick={() => handleDelete(thought.id)} className="px-3 py-1.5 text-sm text-status-error border border-status-error/30 rounded-lg hover:bg-status-error/10 transition-colors">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
