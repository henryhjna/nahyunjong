'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface AnalyticsSummary {
  period: number;
  total: number;
  uniqueVisitors: number;
  today: number;
  topPages: { path: string; views: string }[];
  daily: { date: string; views: string; unique_visitors: string }[];
  locales: { locale: string; views: string }[];
}

export default function AdminAnalyticsPage() {
  const { loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/login');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) fetchAnalytics();
  }, [isAdmin, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/summary?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin) return null;

  // Find max views for bar chart scaling
  const maxViews = data ? Math.max(...data.daily.map((d) => parseInt(d.views)), 1) : 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary mb-2 inline-block">
                ← 대시보드
              </Link>
              <h1 className="text-3xl font-bold text-text-primary">방문자 통계</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      days === d
                        ? 'bg-accent-blue text-white'
                        : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {d}일
                  </button>
                ))}
              </div>
              <button
                onClick={async () => {
                  if (!confirm('현재 IP의 모든 방문 기록을 삭제합니다. 계속?')) return;
                  const token = localStorage.getItem('authToken');
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/purge-my-views`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    const { deleted } = await res.json();
                    alert(`${deleted}건 삭제됨`);
                    fetchAnalytics();
                  }
                }}
                className="px-3 py-1.5 rounded-full text-sm border border-border text-text-tertiary hover:text-status-error hover:border-status-error/30 transition-colors"
              >
                내 기록 제거
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-surface-hover animate-pulse" />
                ))}
              </div>
              <div className="h-64 rounded-xl bg-surface-hover animate-pulse" />
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-surface border border-border">
                  <p className="text-sm text-text-secondary">오늘</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">{data.today}</p>
                </div>
                <div className="p-6 rounded-xl bg-surface border border-border">
                  <p className="text-sm text-text-secondary">{days}일 총 조회</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">{data.total.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-xl bg-surface border border-border">
                  <p className="text-sm text-text-secondary">{days}일 순 방문자</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">{data.uniqueVisitors.toLocaleString()}</p>
                </div>
              </div>

              {/* Daily Chart */}
              <div className="p-6 rounded-xl bg-surface border border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-4">일별 추이</h2>
                <div className="flex items-end gap-[2px] h-40">
                  {data.daily.map((day) => {
                    const views = parseInt(day.views);
                    const height = Math.max((views / maxViews) * 100, 2);
                    return (
                      <div
                        key={day.date}
                        className="flex-1 group relative"
                        title={`${day.date}: ${views} views`}
                      >
                        <div
                          className="w-full bg-accent-blue/70 rounded-t-sm hover:bg-accent-blue transition-colors"
                          style={{ height: `${height}%` }}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-background border border-border rounded-lg px-2 py-1 text-xs text-text-primary whitespace-nowrap shadow-card z-10">
                          {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          <br />{views}회
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two columns: Top Pages + Locale */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Pages */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-surface border border-border">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">인기 페이지</h2>
                  <div className="space-y-2">
                    {data.topPages.map((page, i) => (
                      <div key={page.path} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-text-tertiary w-5 text-right flex-shrink-0">{i + 1}</span>
                          <span className="text-text-primary truncate">{page.path}</span>
                        </div>
                        <span className="text-text-secondary flex-shrink-0 ml-4">{parseInt(page.views).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locale Breakdown */}
                <div className="p-6 rounded-xl bg-surface border border-border">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">언어별</h2>
                  <div className="space-y-3">
                    {data.locales.map((loc) => (
                      <div key={loc.locale} className="flex items-center justify-between text-sm">
                        <span className="text-text-primary">{loc.locale === 'ko' ? '한국어' : loc.locale === 'en' ? 'English' : loc.locale}</span>
                        <span className="text-text-secondary">{parseInt(loc.views).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-16">데이터를 불러올 수 없습니다.</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
