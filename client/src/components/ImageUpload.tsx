'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  category: 'profile' | 'books' | 'lab-members' | 'lab-batches';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onDelete?: () => void;
  label?: string;
  className?: string;
}

export function ImageUpload({
  category,
  currentUrl,
  onUpload,
  onDelete,
  label,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUrl) {
      // 서버에서 받은 URL이면 API URL과 조합
      if (currentUrl.startsWith('/uploads')) {
        setPreview(`${process.env.NEXT_PUBLIC_API_URL}${currentUrl}`);
      } else if (currentUrl.startsWith('http')) {
        setPreview(currentUrl);
      } else {
        setPreview(currentUrl);
      }
    } else {
      setPreview(null);
    }
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPEG, PNG, WebP, GIF 형식만 업로드 가능합니다.');
      return;
    }

    setError(null);

    // 미리보기 생성
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // 업로드 시작
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/${category}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        onUpload(url);
        // 새 URL로 미리보기 업데이트
        setPreview(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
      } else {
        const data = await res.json();
        setError(data.error || '업로드에 실패했습니다.');
        setPreview(currentUrl ? (currentUrl.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${currentUrl}` : currentUrl) : null);
      }
    } catch (err) {
      setError('업로드 중 오류가 발생했습니다.');
      setPreview(currentUrl ? (currentUrl.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${currentUrl}` : currentUrl) : null);
    } finally {
      setUploading(false);
      // input 초기화
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentUrl || !onDelete) return;

    // 파일명 추출
    const filename = currentUrl.split('/').pop();
    if (!filename) return;

    const token = localStorage.getItem('authToken');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/${category}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        setPreview(null);
        onDelete();
      } else {
        const data = await res.json();
        setError(data.error || '삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}

      <div className="flex items-start gap-4">
        {/* 미리보기 */}
        {preview && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border bg-surface-alt">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* 업로드 영역 */}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                업로드 중...
              </span>
            ) : preview ? '변경' : '업로드'}
          </button>

          {preview && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-status-error border border-status-error rounded-lg hover:bg-status-error/10 transition-colors"
            >
              삭제
            </button>
          )}

          <p className="text-xs text-text-muted">
            JPEG, PNG, WebP, GIF (최대 5MB)
          </p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-2 text-sm text-status-error">{error}</p>
      )}
    </div>
  );
}
