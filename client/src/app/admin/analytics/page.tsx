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

interface ExcludedIp {
  id: number;
  ip_hash: string;
  label: string | null;
  created_at: string;
}

export default function AdminAnalyticsPage() {
  const { loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [excludedIps, setExcludedIps] = useState<ExcludedIp[]>([]);
  const [currentIpHash, setCurrentIpHash] = useState('');
  const [showIpManager, setShowIpManager] = useState(false);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/login');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
      fetchExcludedIps();
    }
  }, [isAdmin, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/summary?days=${days}`, {
        headers: getHeaders(),
      });
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExcludedIps = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/excluded-ips`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setExcludedIps(data.ips);
        setCurrentIpHash(data.currentIpHash);
      }
    } catch {}
  };

  const excludeMyIp = async (label: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exclude-my-ip`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      fetchExcludedIps();
      // Also purge existing records from this IP
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/purge-my-views`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      fetchAnalytics();
    }
  };

  const removeExcludedIp = async (id: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/excluded-ips/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    fetchExcludedIps();
  };

  if (authLoading || !isAdmin) return null;

  const isCurrentIpExcluded = excludedIps.some((ip) => ip.ip_hash === currentIpHash);
  const maxViews = data && data.daily.length > 0 ? Math.max(...data.daily.map((d) => parseInt(d.views)), 1) : 1;

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
                onClick={() => setShowIpManager(!showIpManager)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  showIpManager
                    ? 'border-accent-blue text-accent-blue'
                    : 'border-border text-text-tertiary hover:text-text-primary'
                }`}
              >
                IP 관리
              </button>
            </div>
          </div>

          {/* IP Exclusion Manager */}
          {showIpManager && (
            <div className="mb-8 p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-sm font-medium text-text-primary mb-4">제외 IP 관리</h3>

              {/* Current IP status */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-surface-hover">
                <span className="text-sm text-text-secondary">현재 IP: <code className="text-text-tertiary">{currentIpHash}</code></span>
                {isCurrentIpExcluded ? (
                  <span className="px-2 py-0.5 rounded text-xs bg-status-success/20 text-status-success">제외됨</span>
                ) : (
                  <button
                    onClick={() => {
                      const label = prompt('이 IP에 라벨을 붙여주세요 (예: 연구실, 집, 핸드폰)');
                      if (label !== null) excludeMyIp(label || '미지정');
                    }}
                    className="px-3 py-1 rounded-lg text-xs bg-accent-blue text-white hover:bg-accent-blue/90"
                  >
                    이 IP 제외하기
                  </button>
                )}
              </div>

              {/* Excluded IP list */}
              {excludedIps.length > 0 && (
                <div className="space-y-2">
                  {excludedIps.map((ip) => (
                    <div key={ip.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-surface-hover">
                      <div className="flex items-center gap-3">
                        <code className="text-text-tertiary text-xs">{ip.ip_hash}</code>
                        {ip.label && <span className="text-text-secondary">{ip.label}</span>}
                        {ip.ip_hash === currentIpHash && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-accent-blue/10 text-accent-blue">현재</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeExcludedIp(ip.id)}
                        className="text-xs text-text-tertiary hover:text-status-error"
                      >
                        해제
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {excludedIps.length === 0 && (
                <p className="text-sm text-text-tertiary">제외된 IP가 없습니다.</p>
              )}
            </div>
          )}

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
              {data.daily.length > 0 ? (
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
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-background border border-border rounded-lg px-2 py-1 text-xs text-text-primary whitespace-nowrap shadow-card z-10">
                            {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            <br />{views}회
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-surface border border-border text-center">
                  <p className="text-text-tertiary">해당 기간에 데이터가 없습니다.</p>
                </div>
              )}

              {/* Top Pages + Locale */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-xl bg-surface border border-border">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">인기 페이지</h2>
                  {data.topPages.length > 0 ? (
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
                  ) : (
                    <p className="text-text-tertiary text-sm">데이터 없음</p>
                  )}
                </div>

                <div className="p-6 rounded-xl bg-surface border border-border">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">언어별</h2>
                  {data.locales.length > 0 ? (
                    <div className="space-y-3">
                      {data.locales.map((loc) => (
                        <div key={loc.locale} className="flex items-center justify-between text-sm">
                          <span className="text-text-primary">{loc.locale === 'ko' ? '한국어' : loc.locale === 'en' ? 'English' : loc.locale}</span>
                          <span className="text-text-secondary">{parseInt(loc.views).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-tertiary text-sm">데이터 없음</p>
                  )}
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
