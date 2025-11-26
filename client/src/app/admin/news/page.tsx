'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { NewsItem, RepresentativeNews, NewsForm } from '@/lib/types';

const initialForm: NewsForm = {
  title: '',
  content: '',
  source: '',
  source_url: '',
  image_url: '',
  published_at: new Date().toISOString().split('T')[0],
  is_published: false
};

export default function AdminNewsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [representatives, setRepresentatives] = useState<RepresentativeNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NewsForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingOg, setFetchingOg] = useState(false);
  const [ogUrl, setOgUrl] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupingNewsId, setGroupingNewsId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchNews();
      fetchRepresentatives();
    }
  }, [isAdmin]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/admin/all`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepresentatives = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/admin/representatives`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch representatives');
      const data = await response.json();
      setRepresentatives(data);
    } catch (err) {
      console.error('Failed to fetch representatives:', err);
    }
  };

  const fetchOgTags = async () => {
    if (!ogUrl) return;
    setFetchingOg(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/fetch-og`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url: ogUrl })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch OG tags');
      }

      const data = await response.json();
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        content: data.description || prev.content,
        source: data.source || prev.source,
        source_url: data.source_url || prev.source_url,
        image_url: data.image || prev.image_url,
        published_at: data.published_at || prev.published_at
      }));

      // Notify if date extraction failed
      if (!data.published_at) {
        setError('보도일을 자동으로 추출하지 못했습니다. 수동으로 입력해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch OG tags');
    } finally {
      setFetchingOg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/news/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/news`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const data = await response.json();
        // Handle duplicate URL error specially
        if (response.status === 409 && data.existing) {
          throw new Error(`이미 등록된 URL입니다: "${data.existing.title}" (ID: ${data.existing.id})`);
        }
        throw new Error(data.error || 'Failed to save news');
      }

      await fetchNews();
      await fetchRepresentatives();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setForm({
      title: item.title,
      content: item.content || '',
      source: item.source || '',
      source_url: item.source_url || '',
      image_url: item.image_url || '',
      published_at: item.published_at.split('T')[0],
      is_published: item.is_published
    });
    setOgUrl(item.source_url || '');
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete news');
      await fetchNews();
      await fetchRepresentatives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete news');
    }
  };

  const togglePublish = async (item: NewsItem) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${item.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_published: !item.is_published })
      });

      if (!response.ok) throw new Error('Failed to update news');
      await fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update news');
    }
  };

  const handleSetGroup = async (newsId: number, groupId: number | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${newsId}/group`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ group_id: groupId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set group');
      }

      await fetchNews();
      await fetchRepresentatives();
      setShowGroupModal(false);
      setGroupingNewsId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set group');
    }
  };

  const handleSetRepresentative = async (newsId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${newsId}/set-representative`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set representative');
      }

      await fetchNews();
      await fetchRepresentatives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set representative');
    }
  };

  const openGroupModal = (newsId: number) => {
    setGroupingNewsId(newsId);
    setShowGroupModal(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setOgUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">News Management</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm sm:text-base whitespace-nowrap"
          >
            + 새 뉴스 추가
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
              {editingId ? '뉴스 수정' : '새 뉴스 추가'}
            </h2>

            {/* OG Tag Extraction */}
            <div className="mb-6 p-4 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
              <label className="block text-sm font-medium text-accent-blue mb-2">
                URL에서 자동 추출
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={ogUrl}
                  onChange={(e) => setOgUrl(e.target.value)}
                  placeholder="뉴스 URL을 입력하면 제목, 설명, 이미지를 자동으로 추출합니다"
                  className="flex-1 px-4 py-3 rounded-xl bg-surface border border-accent-blue/30 text-text-primary placeholder-text-secondary focus:border-accent-blue focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={fetchOgTags}
                  disabled={fetchingOg || !ogUrl}
                  className="px-4 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {fetchingOg ? '추출 중...' : '추출'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="뉴스 제목"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    출처
                  </label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    placeholder="조선일보, KBS 등"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    보도일 *
                  </label>
                  <input
                    type="date"
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  원문 링크
                </label>
                <input
                  type="url"
                  value={form.source_url}
                  onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  썸네일 이미지 URL
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="https://..."
                />
                {form.image_url && (
                  <div className="mt-2">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-32 object-cover rounded-xl"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  내용/요약
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="뉴스 내용 또는 요약"
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
          <table className="w-full min-w-[900px]">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  제목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-24">
                  그룹
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-24">
                  출처
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-24">
                  보도일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-20">
                  상태
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider w-48">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                    등록된 뉴스가 없습니다.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className={`hover:bg-surface/50 ${!item.is_representative ? 'bg-surface/30' : ''}`}>
                    <td className="px-4 py-4">
                      <div className={`font-medium text-text-primary line-clamp-2 ${item.is_representative ? 'font-bold' : 'pl-4 text-text-secondary'}`}>
                        {!item.is_representative && <span className="text-text-secondary/50 mr-1">└</span>}
                        {item.title}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {item.is_representative ? (
                        <span className="px-2 py-1 bg-accent-purple/10 text-accent-purple rounded text-xs font-medium whitespace-nowrap">
                          대표
                        </span>
                      ) : item.representative_title ? (
                        <span className="text-xs text-text-secondary line-clamp-1" title={item.representative_title}>
                          → {item.representative_title.substring(0, 10)}...
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-text-secondary text-sm">
                      {item.source || '-'}
                    </td>
                    <td className="px-4 py-4 text-text-secondary text-sm whitespace-nowrap">
                      {formatDate(item.published_at)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          item.is_published
                            ? 'bg-status-success/10 text-status-success'
                            : 'bg-surface text-text-secondary'
                        }`}
                      >
                        {item.is_published ? '공개' : '비공개'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1 flex-wrap">
                        <button
                          onClick={() => openGroupModal(item.id)}
                          className="px-2 py-1 text-accent-purple hover:bg-accent-purple/10 rounded font-medium text-xs transition-colors"
                        >
                          그룹
                        </button>
                        {!item.is_representative && (
                          <button
                            onClick={() => handleSetRepresentative(item.id)}
                            className="px-2 py-1 text-status-warning hover:bg-status-warning/10 rounded font-medium text-xs transition-colors"
                          >
                            대표
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 text-accent-blue hover:bg-accent-blue/10 rounded font-medium text-xs transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 text-status-error hover:bg-status-error/10 rounded font-medium text-xs transition-colors"
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

      {/* Group Selection Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-text-primary mb-4">그룹 지정</h3>
            <p className="text-sm text-text-secondary mb-4">
              이 뉴스를 어떤 대표 뉴스의 그룹에 넣을지 선택하세요.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleSetGroup(groupingNewsId!, null)}
                className="w-full text-left p-3 rounded-xl border border-border hover:bg-surface/50 transition-colors"
              >
                <span className="font-medium text-text-primary">그룹 없음 (독립)</span>
                <span className="block text-xs text-text-secondary">이 뉴스를 대표 뉴스로 설정</span>
              </button>

              {representatives
                .filter(rep => rep.id !== groupingNewsId)
                .map((rep) => (
                <button
                  key={rep.id}
                  onClick={() => handleSetGroup(groupingNewsId!, rep.id)}
                  className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent-purple/10 hover:border-accent-purple/30 transition-colors"
                >
                  <span className="font-medium text-text-primary line-clamp-1">{rep.title}</span>
                  <span className="block text-xs text-text-secondary">{formatDate(rep.published_at)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowGroupModal(false);
                setGroupingNewsId(null);
              }}
              className="mt-4 w-full py-3 bg-surface text-text-secondary border border-border rounded-xl hover:bg-surface/80 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
