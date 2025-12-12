'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface Education {
  id?: number;
  degree: string;
  field: string;
  institution: string;
  institution_en: string;
  year_start: number | null;
  year_end: number | null;
  description: string;
  sort_order: number;
}

interface Career {
  id?: number;
  position: string;
  organization: string;
  organization_en: string;
  year_start: number | null;
  year_end: number | null;
  is_current: boolean;
  description: string;
  sort_order: number;
}

interface Award {
  id?: number;
  title: string;
  organization: string;
  year: number | null;
  description: string;
  sort_order: number;
}

interface Profile {
  id: number;
  name: string;
  name_en: string;
  title: string;
  affiliation: string;
  email: string;
  photo_url: string;
  bio: string;
  bio_detail: string;
  research_interests: string[];
  education: Education[];
  career: Career[];
  awards: Award[];
}

export default function AdminProfilePage() {
  const { loading: authLoading, isAdmin, authFetch } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'education' | 'career' | 'awards'>('basic');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [educationModal, setEducationModal] = useState<{ open: boolean; data: Education | null }>({ open: false, data: null });
  const [careerModal, setCareerModal] = useState<{ open: boolean; data: Career | null }>({ open: false, data: null });
  const [awardModal, setAwardModal] = useState<{ open: boolean; data: Award | null }>({ open: false, data: null });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Basic Profile
  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          name_en: profile.name_en,
          title: profile.title,
          affiliation: profile.affiliation,
          email: profile.email,
          photo_url: profile.photo_url,
          bio: profile.bio,
          bio_detail: profile.bio_detail,
          research_interests: profile.research_interests,
        }),
      });

      if (res.ok) {
        showMessage('success', '프로필이 저장되었습니다.');
      } else {
        showMessage('error', '저장에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // Education CRUD
  const handleSaveEducation = async (data: Education) => {
    setSaving(true);
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/profile/education/${data.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/profile/education`;

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showMessage('success', data.id ? '학력이 수정되었습니다.' : '학력이 추가되었습니다.');
        fetchProfile();
        setEducationModal({ open: false, data: null });
      } else {
        showMessage('error', '저장에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/education/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showMessage('success', '삭제되었습니다.');
        fetchProfile();
      } else {
        showMessage('error', '삭제에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '삭제 중 오류가 발생했습니다.');
    }
  };

  // Career CRUD
  const handleSaveCareer = async (data: Career) => {
    setSaving(true);
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/profile/career/${data.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/profile/career`;

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showMessage('success', data.id ? '경력이 수정되었습니다.' : '경력이 추가되었습니다.');
        fetchProfile();
        setCareerModal({ open: false, data: null });
      } else {
        showMessage('error', '저장에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCareer = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/career/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showMessage('success', '삭제되었습니다.');
        fetchProfile();
      } else {
        showMessage('error', '삭제에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '삭제 중 오류가 발생했습니다.');
    }
  };

  // Awards CRUD
  const handleSaveAward = async (data: Award) => {
    setSaving(true);
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/profile/awards/${data.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/profile/awards`;

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showMessage('success', data.id ? '수상이 수정되었습니다.' : '수상이 추가되었습니다.');
        fetchProfile();
        setAwardModal({ open: false, data: null });
      } else {
        showMessage('error', '저장에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAward = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/awards/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showMessage('success', '삭제되었습니다.');
        fetchProfile();
      } else {
        showMessage('error', '삭제에 실패했습니다.');
      }
    } catch (error) {
      showMessage('error', '삭제 중 오류가 발생했습니다.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { key: 'basic', label: '기본 정보' },
    { key: 'education', label: '학력' },
    { key: 'career', label: '경력' },
    { key: 'awards', label: '수상' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-blue mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">프로필 관리</h1>
        </motion.div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-status-success/10 border-status-success/30 text-status-success'
                  : 'bg-status-error/10 border-status-error/30 text-status-error'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface border border-border text-text-secondary hover:border-accent-blue'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && profile && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveBasic}
            className="space-y-6"
          >
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">기본 정보</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">이름 (한글)</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">이름 (영문)</label>
                  <input
                    type="text"
                    value={profile.name_en || ''}
                    onChange={(e) => setProfile({ ...profile, name_en: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">소속</label>
                  <input
                    type="text"
                    value={profile.affiliation || ''}
                    onChange={(e) => setProfile({ ...profile, affiliation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">직함</label>
                  <input
                    type="text"
                    value={profile.title || ''}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">이메일</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <ImageUpload
                category="profile"
                currentUrl={profile.photo_url}
                onUpload={(url) => setProfile({ ...profile, photo_url: url })}
                onDelete={() => setProfile({ ...profile, photo_url: '' })}
                label="프로필 사진"
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">간단 소개 (랜딩 페이지용)</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">상세 소개 (About 페이지용)</label>
                <textarea
                  value={profile.bio_detail || ''}
                  onChange={(e) => setProfile({ ...profile, bio_detail: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  연구 관심사 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={(profile.research_interests || []).join(', ')}
                  onChange={(e) => setProfile({
                    ...profile,
                    research_interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="예: Financial Accounting, AI, Big Data"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium hover:shadow-glow disabled:opacity-50 transition-all"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">학력</h2>
              <button
                onClick={() => setEducationModal({
                  open: true,
                  data: { degree: '', field: '', institution: '', institution_en: '', year_start: null, year_end: null, description: '', sort_order: 0 }
                })}
                className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:shadow-glow transition-all"
              >
                + 추가
              </button>
            </div>

            <div className="space-y-4">
              {profile?.education?.map((edu) => (
                <div key={edu.id} className="glass-card p-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-medium">
                        {edu.degree}
                      </span>
                      {edu.field && <span className="text-text-secondary text-sm">{edu.field}</span>}
                    </div>
                    <h3 className="font-semibold text-text-primary">{edu.institution || edu.institution_en}</h3>
                    {(edu.year_start || edu.year_end) && (
                      <p className="text-sm text-text-tertiary">
                        {edu.year_start} - {edu.year_end || '현재'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEducationModal({ open: true, data: edu })}
                      className="p-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => edu.id && handleDeleteEducation(edu.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-status-error hover:bg-status-error/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {(!profile?.education || profile.education.length === 0) && (
                <div className="text-center py-12 text-text-tertiary">
                  등록된 학력이 없습니다.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Career Tab */}
        {activeTab === 'career' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">경력</h2>
              <button
                onClick={() => setCareerModal({
                  open: true,
                  data: { position: '', organization: '', organization_en: '', year_start: null, year_end: null, is_current: false, description: '', sort_order: 0 }
                })}
                className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:shadow-glow transition-all"
              >
                + 추가
              </button>
            </div>

            <div className="space-y-4">
              {profile?.career?.map((career) => (
                <div key={career.id} className="glass-card p-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {career.is_current && (
                        <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
                          현재
                        </span>
                      )}
                      <span className="text-sm text-text-tertiary">
                        {career.year_start} - {career.year_end || '현재'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary">{career.position}</h3>
                    <p className="text-text-secondary">{career.organization || career.organization_en}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCareerModal({ open: true, data: career })}
                      className="p-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => career.id && handleDeleteCareer(career.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-status-error hover:bg-status-error/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {(!profile?.career || profile.career.length === 0) && (
                <div className="text-center py-12 text-text-tertiary">
                  등록된 경력이 없습니다.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Awards Tab */}
        {activeTab === 'awards' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">수상</h2>
              <button
                onClick={() => setAwardModal({
                  open: true,
                  data: { title: '', organization: '', year: null, description: '', sort_order: 0 }
                })}
                className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:shadow-glow transition-all"
              >
                + 추가
              </button>
            </div>

            <div className="space-y-4">
              {profile?.awards?.map((award) => (
                <div key={award.id} className="glass-card p-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-text-primary">{award.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      {award.organization && <span>{award.organization}</span>}
                      {award.year && <span className="px-2 py-0.5 rounded-full bg-surface-hover text-text-tertiary text-xs">{award.year}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAwardModal({ open: true, data: award })}
                      className="p-2 rounded-lg text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => award.id && handleDeleteAward(award.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-status-error hover:bg-status-error/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {(!profile?.awards || profile.awards.length === 0) && (
                <div className="text-center py-12 text-text-tertiary">
                  등록된 수상이 없습니다.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Education Modal */}
      <AnimatePresence>
        {educationModal.open && (
          <EducationModal
            data={educationModal.data!}
            onSave={handleSaveEducation}
            onClose={() => setEducationModal({ open: false, data: null })}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Career Modal */}
      <AnimatePresence>
        {careerModal.open && (
          <CareerModal
            data={careerModal.data!}
            onSave={handleSaveCareer}
            onClose={() => setCareerModal({ open: false, data: null })}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Award Modal */}
      <AnimatePresence>
        {awardModal.open && (
          <AwardModal
            data={awardModal.data!}
            onSave={handleSaveAward}
            onClose={() => setAwardModal({ open: false, data: null })}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Education Modal Component
function EducationModal({
  data,
  onSave,
  onClose,
  saving,
}: {
  data: Education;
  onSave: (data: Education) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(data);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-background rounded-2xl border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-6">
          {data.id ? '학력 수정' : '학력 추가'}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">학위</label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="예: 박사, Ph.D."
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">전공</label>
              <input
                type="text"
                value={form.field}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">학교명 (한글 또는 영문)</label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="예: 서울대학교 또는 Seoul National University"
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">학교명 (영문, 선택)</label>
            <input
              type="text"
              value={form.institution_en}
              onChange={(e) => setForm({ ...form, institution_en: e.target.value })}
              placeholder="위에 한글로 입력했을 경우 영문명 추가"
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">시작 연도</label>
              <input
                type="number"
                value={form.year_start || ''}
                onChange={(e) => setForm({ ...form, year_start: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">종료 연도</label>
              <input
                type="number"
                value={form.year_end || ''}
                onChange={(e) => setForm({ ...form, year_end: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">정렬 순서</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.degree || (!form.institution && !form.institution_en)}
            className="px-4 py-2 rounded-xl bg-accent-blue text-white font-medium disabled:opacity-50 transition-all"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Career Modal Component
function CareerModal({
  data,
  onSave,
  onClose,
  saving,
}: {
  data: Career;
  onSave: (data: Career) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(data);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-background rounded-2xl border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-6">
          {data.id ? '경력 수정' : '경력 추가'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">직위</label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">기관명 (한글 또는 영문)</label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="예: 홍익대학교 또는 Hongik University"
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">기관명 (영문, 선택)</label>
            <input
              type="text"
              value={form.organization_en}
              onChange={(e) => setForm({ ...form, organization_en: e.target.value })}
              placeholder="위에 한글로 입력했을 경우 영문명 추가"
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">시작 연도</label>
              <input
                type="number"
                value={form.year_start || ''}
                onChange={(e) => setForm({ ...form, year_start: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">종료 연도</label>
              <input
                type="number"
                value={form.year_end || ''}
                onChange={(e) => setForm({ ...form, year_end: e.target.value ? parseInt(e.target.value) : null })}
                disabled={form.is_current}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={(e) => setForm({ ...form, is_current: e.target.checked, year_end: e.target.checked ? null : form.year_end })}
              className="w-4 h-4 rounded border-border text-accent-blue focus:ring-accent-blue"
            />
            <span className="text-sm text-text-secondary">현재 재직 중</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">정렬 순서</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.position || (!form.organization && !form.organization_en)}
            className="px-4 py-2 rounded-xl bg-accent-blue text-white font-medium disabled:opacity-50 transition-all"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Award Modal Component
function AwardModal({
  data,
  onSave,
  onClose,
  saving,
}: {
  data: Award;
  onSave: (data: Award) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(data);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-background rounded-2xl border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-6">
          {data.id ? '수상 수정' : '수상 추가'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">수상명</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">수여 기관</label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">수상 연도</label>
            <input
              type="number"
              value={form.year || ''}
              onChange={(e) => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">정렬 순서</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title}
            className="px-4 py-2 rounded-xl bg-accent-blue text-white font-medium disabled:opacity-50 transition-all"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
