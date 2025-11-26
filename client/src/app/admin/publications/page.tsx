'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { Publication, PublicationForm } from '@/lib/types';

const initialForm: PublicationForm = {
  title: '',
  title_en: '',
  authors: '',
  journal: '',
  journal_tier: '',
  publication_type: 'paper',
  year: new Date().getFullYear(),
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  abstract: '',
  pdf_url: '',
  is_published: true,
  categories: []
};

const journalTiers = ['SSCI', 'SCI', 'SCIE', 'KCI', 'Other'];

export default function AdminPublicationsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PublicationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchPublications();
    }
  }, [isAdmin]);

  // 기존 카테고리 목록 추출
  useEffect(() => {
    const allCategories = publications.flatMap(pub => pub.categories || []);
    const uniqueCategories = [...new Set(allCategories)].sort();
    setExistingCategories(uniqueCategories);
    console.log('Extracted categories:', uniqueCategories); // 디버그용
  }, [publications]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchPublications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications/admin/all`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch publications');
      const data = await response.json();
      console.log('Fetched publications:', data); // 디버그
      console.log('Sample categories:', data[0]?.categories, data[1]?.categories); // 디버그
      setPublications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate: at least one title required
    if (!form.title.trim() && !form.title_en.trim()) {
      setError('한글 제목 또는 영문 제목 중 하나는 필수입니다');
      setSubmitting(false);
      return;
    }

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/publications/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/publications`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save publication');
      }

      await fetchPublications();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save publication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pub: Publication) => {
    setForm({
      title: pub.title || '',
      title_en: pub.title_en || '',
      authors: pub.authors,
      journal: pub.journal || '',
      journal_tier: pub.journal_tier || '',
      publication_type: pub.publication_type || 'paper',
      year: pub.year,
      volume: pub.volume || '',
      issue: pub.issue || '',
      pages: pub.pages || '',
      doi: pub.doi || '',
      abstract: pub.abstract || '',
      pdf_url: pub.pdf_url || '',
      is_published: pub.is_published,
      categories: pub.categories || []
    });
    setEditingId(pub.id);
    setShowForm(true);
    // 폼으로 스크롤
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete publication');
      await fetchPublications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete publication');
    }
  };

  const togglePublish = async (pub: Publication) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications/${pub.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_published: !pub.is_published })
      });

      if (!response.ok) throw new Error('Failed to update publication');
      await fetchPublications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update publication');
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
    setCategoryInput('');
  };

  const addCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !form.categories.includes(trimmed)) {
      setForm({ ...form, categories: [...form.categories, trimmed] });
    }
    setCategoryInput('');
  };

  const removeCategory = (category: string) => {
    setForm({ ...form, categories: form.categories.filter(c => c !== category) });
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
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Publications Management</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm sm:text-base whitespace-nowrap"
          >
            + 새 논문 추가
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-xl text-status-error">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">닫기</button>
          </div>
        )}

        {showForm && (
          <div ref={formRef} className="mb-8 glass-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {editingId ? '논문 수정' : '새 논문 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  유형 *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="publication_type"
                      value="paper"
                      checked={form.publication_type === 'paper'}
                      onChange={(e) => setForm({ ...form, publication_type: e.target.value as 'paper' | 'report' })}
                      className="w-4 h-4 text-accent-blue border-border focus:ring-accent-blue"
                    />
                    <span className="ml-2 text-text-primary">논문 (Paper)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="publication_type"
                      value="report"
                      checked={form.publication_type === 'report'}
                      onChange={(e) => setForm({ ...form, publication_type: e.target.value as 'paper' | 'report' })}
                      className="w-4 h-4 text-accent-blue border-border focus:ring-accent-blue"
                    />
                    <span className="ml-2 text-text-primary">보고서 (Report)</span>
                  </label>
                </div>
              </div>

              {/* 제목 - 둘 중 하나 필수 */}
              <div className="p-4 bg-surface rounded-xl border border-border">
                <p className="text-sm text-text-secondary mb-3">* 한글 제목 또는 영문 제목 중 하나는 필수입니다</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      제목 (한글)
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      placeholder="논문 제목"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      제목 (영문)
                    </label>
                    <input
                      type="text"
                      value={form.title_en}
                      onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      placeholder="English title"
                    />
                  </div>
                </div>
              </div>

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
                  placeholder="나현종, 홍길동, Kim, J."
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    저널명
                  </label>
                  <input
                    type="text"
                    value={form.journal}
                    onChange={(e) => setForm({ ...form, journal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="Journal of Accounting Research"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    등급
                  </label>
                  <select
                    value={form.journal_tier}
                    onChange={(e) => setForm({ ...form, journal_tier: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  >
                    <option value="">선택</option>
                    {journalTiers.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    연도 *
                  </label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={form.volume}
                    onChange={(e) => setForm({ ...form, volume: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Issue
                  </label>
                  <input
                    type="text"
                    value={form.issue}
                    onChange={(e) => setForm({ ...form, issue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="123-145"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  DOI
                </label>
                <input
                  type="text"
                  value={form.doi}
                  onChange={(e) => setForm({ ...form, doi: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="10.1000/xyz123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  PDF URL
                </label>
                <input
                  type="url"
                  value={form.pdf_url}
                  onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* 연구 분야 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  연구 분야 (복수 선택 가능)
                </label>

                {/* 기존 카테고리 선택 */}
                {existingCategories.length > 0 && (
                  <div className="mb-3 p-3 bg-surface rounded-xl border border-border">
                    <p className="text-xs text-text-secondary mb-2">기존 연구분야 클릭하여 선택:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (!form.categories.includes(cat)) {
                              setForm({ ...form, categories: [...form.categories, cat] });
                            }
                          }}
                          disabled={form.categories.includes(cat)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            form.categories.includes(cat)
                              ? 'bg-accent-blue/20 text-accent-blue/50 cursor-not-allowed'
                              : 'bg-surface border border-border text-text-primary hover:bg-accent-blue/10 hover:border-accent-blue/30'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 새 카테고리 입력 */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="새 연구분야 입력 후 Enter 또는 추가 버튼"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-4 py-3 bg-surface text-text-secondary border border-border rounded-xl hover:bg-surface/80 transition-colors"
                  >
                    추가
                  </button>
                </div>

                {/* 선택된 카테고리 */}
                {form.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
                    <span className="text-xs text-accent-blue w-full mb-1">선택된 연구분야:</span>
                    {form.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => removeCategory(cat)}
                          className="hover:text-accent-cyan"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  초록 (Abstract)
                </label>
                <textarea
                  value={form.abstract}
                  onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="논문 초록"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4 text-accent-blue border-border rounded focus:ring-accent-blue"
                />
                <label htmlFor="is_published" className="ml-2 text-sm text-text-secondary">
                  바로 공개
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {submitting ? '저장 중...' : (editingId ? '수정' : '추가')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-surface text-text-secondary border border-border rounded-xl hover:bg-surface/80 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-card overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-20 whitespace-nowrap">
                  유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  제목 / 저자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  저널 / 분야
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-16 whitespace-nowrap">
                  연도
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-20 whitespace-nowrap">
                  상태
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider w-24 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {publications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                    등록된 논문이 없습니다.
                  </td>
                </tr>
              ) : (
                publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-surface/50">
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        pub.publication_type === 'paper'
                          ? 'bg-accent-purple/10 text-accent-purple'
                          : 'bg-status-warning/10 text-status-warning'
                      }`}>
                        {pub.publication_type === 'paper' ? '논문' : '보고서'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-text-primary line-clamp-1">
                        {pub.title || pub.title_en}
                      </div>
                      {pub.title && pub.title_en && (
                        <div className="text-sm text-text-secondary/60 line-clamp-1">
                          {pub.title_en}
                        </div>
                      )}
                      <div className="text-sm text-text-secondary line-clamp-1">
                        {pub.authors}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-text-secondary line-clamp-1">{pub.journal || '-'}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pub.journal_tier && (
                          <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded text-xs">
                            {pub.journal_tier}
                          </span>
                        )}
                        {pub.categories?.slice(0, 2).map((cat) => (
                          <span key={cat} className="px-2 py-0.5 bg-surface text-text-secondary rounded text-xs">
                            {cat}
                          </span>
                        ))}
                        {pub.categories?.length > 2 && (
                          <span className="px-2 py-0.5 bg-surface text-text-secondary/60 rounded text-xs">
                            +{pub.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      {pub.year}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePublish(pub)}
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          pub.is_published
                            ? 'bg-status-success/10 text-status-success'
                            : 'bg-surface text-text-secondary'
                        }`}
                      >
                        {pub.is_published ? '공개' : '비공개'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(pub)}
                          className="text-accent-blue hover:text-accent-cyan font-medium transition-colors whitespace-nowrap"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(pub.id)}
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
