'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import type { LabMember, LabProject, ProjectLink, MemberForm } from '@/lib/types';

interface ProjectForm {
  batch: string;
  title: string;
  description: string;
  is_published: boolean;
  order_index: number;
  links: ProjectLink[];
}

const initialMemberForm: MemberForm = {
  name: '',
  name_en: '',
  batch: '',
  is_professor: false,
  email: '',
  photo_url: '',
  graduation_year: '',
  current_position: '',
  linkedin_url: '',
  is_active: true,
  order_index: 0
};

const initialProjectForm: ProjectForm = {
  batch: '',
  title: '',
  description: '',
  is_published: true,
  order_index: 0,
  links: []
};

interface BatchMeta {
  batch: number;
  hero_image_url: string | null;
  year: number | null;
  description: string | null;
}

interface BatchMetaForm {
  batch: string;
  hero_image_url: string;
  year: string;
  description: string;
}

const initialBatchMetaForm: BatchMetaForm = {
  batch: '',
  hero_image_url: '',
  year: '',
  description: ''
};

const defaultLinkTypes = [
  { value: 'website', label: 'Website' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'paper', label: 'Paper/논문' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other', label: '기타' }
];

export default function AdminLabPage() {
  const { loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'members' | 'projects' | 'batchMeta'>('members');

  // Members state
  const [members, setMembers] = useState<LabMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState<MemberForm>(initialMemberForm);

  // Projects state
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(initialProjectForm);

  // Batch Meta state
  const [batchMetas, setBatchMetas] = useState<BatchMeta[]>([]);
  const [loadingBatchMetas, setLoadingBatchMetas] = useState(true);
  const [showBatchMetaForm, setShowBatchMetaForm] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null);
  const [batchMetaForm, setBatchMetaForm] = useState<BatchMetaForm>(initialBatchMetaForm);

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchMembers();
      fetchProjects();
      fetchBatchMetas();
    }
  }, [isAdmin]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ========================================
  // Members Functions
  // ========================================

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/members/admin/all`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch lab members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lab members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingMemberId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/lab/members/${editingMemberId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/lab/members`;

      const payload = {
        ...memberForm,
        batch: memberForm.batch ? parseInt(memberForm.batch) : null,
        graduation_year: memberForm.graduation_year ? parseInt(memberForm.graduation_year) : null
      };

      const response = await fetch(url, {
        method: editingMemberId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save member');
      }

      await fetchMembers();
      resetMemberForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = (member: LabMember) => {
    setMemberForm({
      name: member.name,
      name_en: member.name_en || '',
      batch: member.batch?.toString() || '',
      is_professor: member.is_professor,
      email: member.email || '',
      photo_url: member.photo_url || '',
      graduation_year: member.graduation_year?.toString() || '',
      current_position: member.current_position || '',
      linkedin_url: member.linkedin_url || '',
      is_active: member.is_active,
      order_index: member.order_index
    });
    setEditingMemberId(member.id);
    setShowMemberForm(true);
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/members/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete member');
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  const toggleMemberActive = async (member: LabMember) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/members/${member.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !member.is_active })
      });

      if (!response.ok) throw new Error('Failed to update member');
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    }
  };

  const resetMemberForm = () => {
    setMemberForm(initialMemberForm);
    setEditingMemberId(null);
    setShowMemberForm(false);
  };

  // ========================================
  // Projects Functions
  // ========================================

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/projects/admin/all`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingProjectId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/lab/projects/${editingProjectId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/lab/projects`;

      const payload = {
        ...projectForm,
        batch: parseInt(projectForm.batch)
      };

      const response = await fetch(url, {
        method: editingProjectId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save project');
      }

      await fetchProjects();
      resetProjectForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = (project: LabProject) => {
    setProjectForm({
      batch: project.batch.toString(),
      title: project.title,
      description: project.description || '',
      is_published: project.is_published,
      order_index: project.order_index,
      links: project.links.map(l => ({
        link_type: l.link_type,
        url: l.url,
        title: l.title || ''
      }))
    });
    setEditingProjectId(project.id);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까? 프로젝트에 연결된 모든 링크도 함께 삭제됩니다.')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete project');
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const toggleProjectPublished = async (project: LabProject) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/projects/${project.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_published: !project.is_published })
      });

      if (!response.ok) throw new Error('Failed to update project');
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const resetProjectForm = () => {
    setProjectForm(initialProjectForm);
    setEditingProjectId(null);
    setShowProjectForm(false);
  };

  const addLink = () => {
    setProjectForm({
      ...projectForm,
      links: [...projectForm.links, { link_type: 'website', url: '', title: '' }]
    });
  };

  const removeLink = (index: number) => {
    setProjectForm({
      ...projectForm,
      links: projectForm.links.filter((_, i) => i !== index)
    });
  };

  const updateLink = (index: number, field: keyof ProjectLink, value: string) => {
    const newLinks = [...projectForm.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setProjectForm({ ...projectForm, links: newLinks });
  };

  // ========================================
  // Batch Meta Functions
  // ========================================

  const fetchBatchMetas = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/batch-meta/admin/all`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch batch meta');
      const data = await response.json();
      setBatchMetas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batch meta');
    } finally {
      setLoadingBatchMetas(false);
    }
  };

  const handleBatchMetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const batchNum = parseInt(batchMetaForm.batch);
      if (isNaN(batchNum)) {
        throw new Error('기수는 숫자여야 합니다');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/batch-meta/${batchNum}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          hero_image_url: batchMetaForm.hero_image_url || null,
          year: batchMetaForm.year ? parseInt(batchMetaForm.year) : null,
          description: batchMetaForm.description || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save batch meta');
      }

      await fetchBatchMetas();
      resetBatchMetaForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save batch meta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBatchMeta = (meta: BatchMeta) => {
    setBatchMetaForm({
      batch: meta.batch.toString(),
      hero_image_url: meta.hero_image_url || '',
      year: meta.year?.toString() || '',
      description: meta.description || ''
    });
    setEditingBatchId(meta.batch);
    setShowBatchMetaForm(true);
  };

  const handleDeleteBatchMeta = async (batch: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/batch-meta/${batch}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete batch meta');
      await fetchBatchMetas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete batch meta');
    }
  };

  const resetBatchMetaForm = () => {
    setBatchMetaForm(initialBatchMetaForm);
    setEditingBatchId(null);
    setShowBatchMetaForm(false);
  };

  // ========================================
  // Render
  // ========================================

  if (authLoading || (loadingMembers && loadingProjects)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) return null;

  // Group projects by batch for display
  const projectsByBatch = projects.reduce((acc, project) => {
    if (!acc[project.batch]) {
      acc[project.batch] = [];
    }
    acc[project.batch].push(project);
    return acc;
  }, {} as Record<number, LabProject[]>);

  const sortedBatches = Object.keys(projectsByBatch)
    .map(Number)
    .sort((a, b) => b - a);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Lab Management</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/30 rounded-xl text-status-error">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">닫기</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              구성원 관리
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'projects'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              프로젝트 관리
            </button>
            <button
              onClick={() => setActiveTab('batchMeta')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'batchMeta'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              기수 메타 관리
            </button>
          </nav>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  resetMemberForm();
                  setShowMemberForm(true);
                }}
                className="px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm"
              >
                + 새 구성원 추가
              </button>
            </div>

            {showMemberForm && (
              <div className="mb-8 glass-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  {editingMemberId ? '구성원 수정' : '새 구성원 추가'}
                </h2>
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        이름 (한글) *
                      </label>
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        이름 (영문)
                      </label>
                      <input
                        type="text"
                        value={memberForm.name_en}
                        onChange={(e) => setMemberForm({ ...memberForm, name_en: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="Gildong Hong"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        기수 {!memberForm.is_professor && '*'}
                      </label>
                      <input
                        type="number"
                        value={memberForm.batch}
                        onChange={(e) => setMemberForm({ ...memberForm, batch: e.target.value })}
                        disabled={memberForm.is_professor}
                        required={!memberForm.is_professor}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors disabled:bg-surface-hover disabled:text-text-tertiary disabled:text-gray-500"
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">기수 번호 (1, 2, 3...)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="flex items-center pt-7">
                      <input
                        type="checkbox"
                        id="is_professor"
                        checked={memberForm.is_professor}
                        onChange={(e) => setMemberForm({ ...memberForm, is_professor: e.target.checked, batch: e.target.checked ? '' : memberForm.batch })}
                        className="w-4 h-4 rounded border-border text-accent-blue focus:ring-accent-blue"
                      />
                      <label htmlFor="is_professor" className="ml-2 text-sm text-text-secondary">
                        지도교수
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        졸업년도
                      </label>
                      <input
                        type="number"
                        value={memberForm.graduation_year}
                        onChange={(e) => setMemberForm({ ...memberForm, graduation_year: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="2024 (재학 중이면 비워두세요)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        표시 순서
                      </label>
                      <input
                        type="number"
                        value={memberForm.order_index}
                        onChange={(e) => setMemberForm({ ...memberForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <ImageUpload
                    category="lab-members"
                    currentUrl={memberForm.photo_url}
                    onUpload={(url) => setMemberForm({ ...memberForm, photo_url: url })}
                    onDelete={() => setMemberForm({ ...memberForm, photo_url: '' })}
                    label="프로필 사진"
                  />

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      현재 직장 (졸업생)
                    </label>
                    <input
                      type="text"
                      value={memberForm.current_position}
                      onChange={(e) => setMemberForm({ ...memberForm, current_position: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      placeholder="삼성전자 연구원"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={memberForm.linkedin_url}
                      onChange={(e) => setMemberForm({ ...memberForm, linkedin_url: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="member_is_active"
                      checked={memberForm.is_active}
                      onChange={(e) => setMemberForm({ ...memberForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-accent-blue focus:ring-accent-blue"
                    />
                    <label htmlFor="member_is_active" className="ml-2 text-sm text-text-secondary">
                      활성 (웹사이트에 표시)
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                    >
                      {submitting ? '저장 중...' : (editingMemberId ? '수정' : '추가')}
                    </button>
                    <button
                      type="button"
                      onClick={resetMemberForm}
                      className="px-6 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-hover transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-16 whitespace-nowrap">
                        기수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-24 whitespace-nowrap">
                        졸업상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-20 whitespace-nowrap">
                        상태
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider w-24 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                          등록된 구성원이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr key={member.id} className="hover:bg-surface">
                          <td className="px-6 py-4">
                            <div className="font-medium text-text-primary">{member.name}</div>
                            {member.name_en && (
                              <div className="text-sm text-text-secondary">{member.name_en}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-text-secondary">
                            {member.is_professor ? (
                              <span className="px-2 py-1 bg-accent-purple/10 text-accent-purple rounded text-xs font-medium">
                                교수
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue rounded text-xs font-medium">
                                {member.batch}기
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-text-secondary">
                            {member.graduation_year
                              ? `${member.graduation_year}년 졸업`
                              : '재학 중'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleMemberActive(member)}
                              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                member.is_active
                                  ? 'bg-status-success/10 text-status-success'
                                  : 'bg-gray-100 text-text-secondary'
                              }`}
                            >
                              {member.is_active ? '활성' : '비활성'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditMember(member)}
                                className="text-accent-blue hover:text-accent-cyan font-medium transition-colors whitespace-nowrap"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id)}
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
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  resetProjectForm();
                  setShowProjectForm(true);
                }}
                className="px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm"
              >
                + 새 프로젝트 추가
              </button>
            </div>

            {showProjectForm && (
              <div className="mb-8 glass-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  {editingProjectId ? '프로젝트 수정' : '새 프로젝트 추가'}
                </h2>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        기수 *
                      </label>
                      <input
                        type="number"
                        value={projectForm.batch}
                        onChange={(e) => setProjectForm({ ...projectForm, batch: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        프로젝트 제목 *
                      </label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="프로젝트 제목"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      프로젝트 설명
                    </label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      placeholder="프로젝트에 대한 상세 설명"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      링크
                    </label>
                    <div className="space-y-3">
                      {projectForm.links.map((link, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <select
                            value={link.link_type}
                            onChange={(e) => updateLink(index, 'link_type', e.target.value)}
                            className="px-3 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                          >
                            {defaultLinkTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            placeholder="URL"
                            className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                          />
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(index, 'title', e.target.value)}
                            placeholder="표시 텍스트 (선택)"
                            className="w-40 px-3 py-2 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="px-3 py-2 text-status-error hover:bg-status-error/10 rounded-xl transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLink}
                        className="text-accent-blue hover:text-accent-cyan text-sm transition-colors font-medium"
                      >
                        + 링크 추가
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        표시 순서
                      </label>
                      <input
                        type="number"
                        value={projectForm.order_index}
                        onChange={(e) => setProjectForm({ ...projectForm, order_index: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex items-center pt-7">
                      <input
                        type="checkbox"
                        id="project_is_published"
                        checked={projectForm.is_published}
                        onChange={(e) => setProjectForm({ ...projectForm, is_published: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-accent-blue focus:ring-accent-blue"
                      />
                      <label htmlFor="project_is_published" className="ml-2 text-sm text-text-secondary">
                        공개 (웹사이트에 표시)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                    >
                      {submitting ? '저장 중...' : (editingProjectId ? '수정' : '추가')}
                    </button>
                    <button
                      type="button"
                      onClick={resetProjectForm}
                      className="px-6 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-hover transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}

            {sortedBatches.length === 0 ? (
              <div className="glass-card p-12 text-center text-text-tertiary">
                등록된 프로젝트가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {sortedBatches.map(batch => (
                  <div key={batch} className="glass-card overflow-hidden">
                    <div className="bg-surface px-6 py-3 border-b border-border">
                      <h3 className="font-bold text-text-primary">{batch}기 프로젝트</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {projectsByBatch[batch].map(project => (
                        <div key={project.id} className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-text-primary">{project.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  project.is_published
                                    ? 'bg-status-success/10 text-status-success'
                                    : 'bg-gray-100 text-text-secondary'
                                }`}>
                                  {project.is_published ? '공개' : '비공개'}
                                </span>
                              </div>
                              {project.description && (
                                <p className="text-sm text-text-secondary mt-1">{project.description}</p>
                              )}
                              {project.links.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {project.links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-surface-hover text-text-secondary rounded text-xs hover:bg-surface-hover"
                                    >
                                      {getLinkIcon(link.link_type)}
                                      {link.title || defaultLinkTypes.find(t => t.value === link.link_type)?.label || link.link_type}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => toggleProjectPublished(project)}
                                className="text-text-tertiary hover:text-text-primary text-sm transition-colors"
                              >
                                {project.is_published ? '숨기기' : '공개'}
                              </button>
                              <button
                                onClick={() => handleEditProject(project)}
                                className="text-accent-blue hover:text-accent-cyan text-sm transition-colors font-medium"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-status-error hover:text-status-error/80 text-sm font-medium transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Batch Meta Tab */}
        {activeTab === 'batchMeta' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  resetBatchMetaForm();
                  setShowBatchMetaForm(true);
                }}
                className="px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all text-sm"
              >
                + 새 기수 메타 추가
              </button>
            </div>

            {showBatchMetaForm && (
              <div className="mb-8 glass-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  {editingBatchId ? '기수 메타 수정' : '새 기수 메타 추가'}
                </h2>
                <form onSubmit={handleBatchMetaSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        기수 번호 *
                      </label>
                      <input
                        type="number"
                        value={batchMetaForm.batch}
                        onChange={(e) => setBatchMetaForm({ ...batchMetaForm, batch: e.target.value })}
                        required
                        disabled={!!editingBatchId}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors disabled:bg-surface-hover disabled:text-text-tertiary"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        연도
                      </label>
                      <input
                        type="number"
                        value={batchMetaForm.year}
                        onChange={(e) => setBatchMetaForm({ ...batchMetaForm, year: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUpload
                      category="lab-batches"
                      currentUrl={batchMetaForm.hero_image_url}
                      onUpload={(url) => setBatchMetaForm({ ...batchMetaForm, hero_image_url: url })}
                      onDelete={() => setBatchMetaForm({ ...batchMetaForm, hero_image_url: '' })}
                      label="Hero 이미지"
                    />
                    <p className="text-xs text-gray-500 mt-1">기수별 대표 이미지 (권장: 1920x600px 이상)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      설명
                    </label>
                    <textarea
                      value={batchMetaForm.description}
                      onChange={(e) => setBatchMetaForm({ ...batchMetaForm, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text-primary focus:border-accent-blue focus:outline-none transition-colors"
                      placeholder="기수에 대한 간단한 설명 (선택)"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                    >
                      {submitting ? '저장 중...' : (editingBatchId ? '수정' : '추가')}
                    </button>
                    <button
                      type="button"
                      onClick={resetBatchMetaForm}
                      className="px-6 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-hover transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loadingBatchMetas ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
              </div>
            ) : batchMetas.length === 0 ? (
              <div className="glass-card p-12 text-center text-text-tertiary">
                등록된 기수 메타 정보가 없습니다.
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-16 whitespace-nowrap">
                        기수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-20 whitespace-nowrap">
                        연도
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-28 whitespace-nowrap">
                        Hero 이미지
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        설명
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider w-24 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batchMetas.map((meta) => (
                      <tr key={meta.batch} className="hover:bg-surface">
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-sm font-medium">
                            {meta.batch}기
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {meta.year ? `${meta.year}년` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {meta.hero_image_url ? (
                            <a
                              href={meta.hero_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-blue hover:text-accent-cyan text-sm transition-colors"
                            >
                              이미지 보기 ↗
                            </a>
                          ) : (
                            <span className="text-text-tertiary text-sm">없음</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-secondary text-sm max-w-xs truncate">
                          {meta.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditBatchMeta(meta)}
                              className="text-accent-blue hover:text-accent-cyan font-medium transition-colors whitespace-nowrap"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteBatchMeta(meta.batch)}
                              className="text-status-error hover:text-status-error/80 font-medium transition-colors whitespace-nowrap"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function getLinkIcon(type: string): string {
  switch (type) {
    case 'website': return '🌐';
    case 'youtube': return '📺';
    case 'github': return '💻';
    case 'paper': return '📄';
    case 'presentation': return '📊';
    default: return '🔗';
  }
}
