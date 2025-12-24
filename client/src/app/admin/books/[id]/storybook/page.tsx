'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StorybookAdmin from '@/components/book-storybook/StorybookAdmin';

interface BookData {
  id: number;
  title: string;
}

export default function AdminStorybookPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7341';
        const res = await authFetch(`${apiUrl}/api/books/admin/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBook(data);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchBook();
    }
  }, [user, id, authFetch]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-text-primary mb-2">도서를 찾을 수 없습니다</h1>
          <button
            onClick={() => router.push('/admin/books')}
            className="text-accent-blue hover:underline"
          >
            도서 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <StorybookAdmin bookId={id} bookTitle={book.title} />;
}
