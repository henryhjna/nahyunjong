'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  X,
  Save,
  ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import { BookChapter, BookPage } from '@/lib/types';
import { containerVariants, itemVariants } from '@/lib/animations';

interface StorybookAdminProps {
  bookId: string;
  bookTitle: string;
}

interface PageEditorState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  chapterId: number | null;
  page: BookPage | null;
}

interface ChapterCoverEditorState {
  isOpen: boolean;
  chapter: BookChapter | null;
}

export default function StorybookAdmin({ bookId, bookTitle }: StorybookAdminProps) {
  const router = useRouter();
  const { authFetch } = useAuth();
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  // Chapter form
  const [chapterForm, setChapterForm] = useState({ title: '' });
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [showChapterForm, setShowChapterForm] = useState(false);

  // Page editor modal
  const [pageEditor, setPageEditor] = useState<PageEditorState>({
    isOpen: false,
    mode: 'create',
    chapterId: null,
    page: null,
  });
  const [pageForm, setPageForm] = useState({ image_url: '', text_content: '' });
  const [saving, setSaving] = useState(false);

  // Chapter cover editor modal
  const [coverEditor, setCoverEditor] = useState<ChapterCoverEditorState>({
    isOpen: false,
    chapter: null,
  });
  const [coverForm, setCoverForm] = useState({ cover_image_url: '' });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    try {
      const res = await authFetch(`${apiUrl}/api/books/${bookId}/storybook/admin`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setChapters(data.chapters || []);
      // Expand all chapters by default
      setExpandedChapters(new Set(data.chapters?.map((c: BookChapter) => c.id) || []));
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [authFetch, apiUrl, bookId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Chapter CRUD
  const handleCreateChapter = async () => {
    if (!chapterForm.title.trim()) return;
    try {
      const res = await authFetch(`${apiUrl}/api/books/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: chapterForm.title }),
      });
      if (!res.ok) throw new Error('Failed to create');
      await fetchChapters();
      setChapterForm({ title: '' });
      setShowChapterForm(false);
    } catch {
      setError('챕터 생성에 실패했습니다');
    }
  };

  const handleUpdateChapter = async (chapterId: number) => {
    if (!chapterForm.title.trim()) return;
    try {
      const res = await authFetch(`${apiUrl}/api/books/${bookId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: chapterForm.title }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchChapters();
      setChapterForm({ title: '' });
      setEditingChapterId(null);
    } catch {
      setError('챕터 수정에 실패했습니다');
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm('이 챕터와 모든 페이지를 삭제하시겠습니까?')) return;
    try {
      const res = await authFetch(`${apiUrl}/api/books/${bookId}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchChapters();
    } catch {
      setError('챕터 삭제에 실패했습니다');
    }
  };

  // Chapter cover image
  const openCoverEditor = (chapter: BookChapter) => {
    setCoverEditor({ isOpen: true, chapter });
    setCoverForm({ cover_image_url: chapter.cover_image_url || '' });
  };

  const closeCoverEditor = () => {
    setCoverEditor({ isOpen: false, chapter: null });
    setCoverForm({ cover_image_url: '' });
  };

  const handleSaveCover = async () => {
    if (!coverEditor.chapter) return;
    setSaving(true);
    try {
      const res = await authFetch(`${apiUrl}/api/books/${bookId}/chapters/${coverEditor.chapter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image_url: coverForm.cover_image_url || null }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchChapters();
      closeCoverEditor();
    } catch {
      setError('커버 이미지 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  // Page CRUD
  const openPageEditor = (chapterId: number, page?: BookPage) => {
    setPageEditor({
      isOpen: true,
      mode: page ? 'edit' : 'create',
      chapterId,
      page: page || null,
    });
    setPageForm({
      image_url: page?.image_url || '',
      text_content: page?.text_content || '',
    });
  };

  const closePageEditor = () => {
    setPageEditor({ isOpen: false, mode: 'create', chapterId: null, page: null });
    setPageForm({ image_url: '', text_content: '' });
  };

  const handleSavePage = async () => {
    if (!pageEditor.chapterId) return;
    setSaving(true);
    try {
      const url =
        pageEditor.mode === 'create'
          ? `${apiUrl}/api/books/${bookId}/chapters/${pageEditor.chapterId}/pages`
          : `${apiUrl}/api/books/${bookId}/pages/${pageEditor.page?.id}`;

      const res = await authFetch(url, {
        method: pageEditor.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageForm),
      });

      if (!res.ok) throw new Error('Failed to save');
      await fetchChapters();
      closePageEditor();
    } catch {
      setError('페이지 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    if (!confirm('이 페이지를 삭제하시겠습니까?')) return;
    try {
      const res = await authFetch(`${apiUrl}/api/books/${bookId}/pages/${pageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchChapters();
    } catch {
      setError('페이지 삭제에 실패했습니다');
    }
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/books')}
                className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Storybook 관리</h1>
                <p className="text-sm text-text-secondary">{bookTitle}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/book/${bookId}/storybook`)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 text-accent-blue rounded-lg hover:bg-accent-blue/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              미리보기
            </button>
          </div>
        </div>
      </header>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-error text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            {error}
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Add chapter button */}
        <div className="mb-6">
          {showChapterForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card p-4"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ title: e.target.value })}
                  placeholder="챕터 제목 입력"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  autoFocus
                />
                <button
                  onClick={handleCreateChapter}
                  className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowChapterForm(false);
                    setChapterForm({ title: '' });
                  }}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowChapterForm(true)}
              className="flex items-center gap-2 px-4 py-3 w-full border-2 border-dashed border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              새 챕터 추가
            </button>
          )}
        </div>

        {/* Chapters list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {chapters.map((chapter) => (
            <motion.div
              key={chapter.id}
              variants={itemVariants}
              className="glass-card overflow-hidden"
            >
              {/* Chapter header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <GripVertical className="w-5 h-5 text-text-muted cursor-grab" />

                {editingChapterId === chapter.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ title: e.target.value })}
                      className="flex-1 px-3 py-1 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateChapter(chapter.id)}
                      className="px-3 py-1 bg-accent-blue text-white rounded hover:bg-accent-blue/90"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingChapterId(null);
                        setChapterForm({ title: '' });
                      }}
                      className="px-3 py-1 text-text-secondary hover:text-text-primary"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                      <span className="font-medium text-text-primary">{chapter.title}</span>
                      <span className="text-sm text-text-muted">
                        ({chapter.pages?.length || 0}페이지)
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCoverEditor(chapter)}
                        className={`p-2 transition-colors ${
                          chapter.cover_image_url
                            ? 'text-accent-blue hover:text-accent-blue/80'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                        title="챕터 커버 이미지"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingChapterId(chapter.id);
                          setChapterForm({ title: chapter.title });
                        }}
                        className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="p-2 text-text-secondary hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Chapter pages */}
              <AnimatePresence>
                {expandedChapters.has(chapter.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {(chapter.pages || []).map((page, idx) => (
                        <div
                          key={page.id}
                          className="group relative aspect-[3/4] bg-background border border-border rounded-lg overflow-hidden cursor-pointer hover:border-accent-blue transition-colors"
                          onClick={() => openPageEditor(chapter.id, page)}
                        >
                          {page.image_url ? (
                            <img
                              src={page.image_url.startsWith('http') ? page.image_url : `${apiUrl}${page.image_url}`}
                              alt={`Page ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <span className="text-white text-xs">#{idx + 1}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                            className="absolute top-1 right-1 p-1 bg-error/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add page button */}
                      <button
                        onClick={() => openPageEditor(chapter.id)}
                        className="aspect-[3/4] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-text-muted hover:text-text-primary hover:border-accent-blue/50 transition-colors"
                      >
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-xs">페이지 추가</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {chapters.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p>아직 챕터가 없습니다.</p>
            <p className="text-sm mt-1">위의 버튼을 클릭하여 첫 챕터를 추가하세요.</p>
          </div>
        )}
      </main>

      {/* Page editor modal */}
      <AnimatePresence>
        {pageEditor.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closePageEditor}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface">
                <h2 className="text-lg font-bold text-text-primary">
                  {pageEditor.mode === 'create' ? '페이지 추가' : '페이지 수정'}
                </h2>
                <button
                  onClick={closePageEditor}
                  className="p-2 text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Image upload */}
                <ImageUpload
                  currentUrl={pageForm.image_url}
                  onUpload={(url) => setPageForm((f) => ({ ...f, image_url: url }))}
                  onDelete={() => setPageForm((f) => ({ ...f, image_url: '' }))}
                  category="book-pages"
                  label="페이지 이미지"
                />

                {/* Text content */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    텍스트 내용
                  </label>
                  <textarea
                    value={pageForm.text_content}
                    onChange={(e) => setPageForm((f) => ({ ...f, text_content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                    placeholder="이 페이지에 표시할 텍스트를 입력하세요..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closePageEditor}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSavePage}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter cover editor modal */}
      <AnimatePresence>
        {coverEditor.isOpen && coverEditor.chapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeCoverEditor}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-surface">
                <h2 className="text-lg font-bold text-text-primary">
                  챕터 커버 이미지
                </h2>
                <button
                  onClick={closeCoverEditor}
                  className="p-2 text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-sm text-text-secondary">
                  챕터 &quot;{coverEditor.chapter.title}&quot;의 타이틀 페이지에 표시될 이미지입니다.
                </p>

                <ImageUpload
                  currentUrl={coverForm.cover_image_url}
                  onUpload={(url) => setCoverForm({ cover_image_url: url })}
                  onDelete={() => setCoverForm({ cover_image_url: '' })}
                  category="book-pages"
                  label="커버 이미지"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeCoverEditor}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveCover}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
