// Common shared types for the application
// Centralizes type definitions to avoid duplication across pages

// ============================================
// Profile & About Related Types
// ============================================

export interface Education {
  id: number;
  degree: string;
  field: string | null;
  institution: string;
  institution_en: string | null;
  year_start: number | null;
  year_end: number | null;
  description: string | null;
  sort_order: number;
}

export interface Career {
  id: number;
  position: string;
  organization: string;
  organization_en: string | null;
  year_start: number | null;
  year_end: number | null;
  is_current: boolean;
  description: string | null;
  sort_order: number;
}

export interface Award {
  id: number;
  title: string;
  organization: string | null;
  year: number | null;
  description: string | null;
  sort_order: number;
}

export interface ProfileBasic {
  id: number;
  name: string;
  name_en: string | null;
  title: string | null;
  affiliation: string | null;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  research_interests: string[] | null;
}

export interface Profile extends ProfileBasic {
  bio_detail: string | null;
  education: Education[];
  career: Career[];
  awards: Award[];
}

// ============================================
// Publication Related Types
// ============================================

export type PublicationType = 'paper' | 'report';

export interface Publication {
  id: number;
  title: string | null;
  title_en: string | null;
  authors: string;
  journal: string | null;
  journal_tier: string | null;
  publication_type: PublicationType;
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  abstract: string | null;
  pdf_url: string | null;
  is_published: boolean;
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface PublicationForm {
  title: string;
  title_en: string;
  authors: string;
  journal: string;
  journal_tier: string;
  publication_type: PublicationType;
  year: number;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  abstract: string;
  pdf_url: string;
  is_published: boolean;
  categories: string[];
}

// ============================================
// Book Related Types
// ============================================

export interface Book {
  id: number;
  title: string;
  subtitle: string | null;
  authors: string;
  publisher: string | null;
  published_date: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  description: string | null;
  table_of_contents: string | null;
  purchase_url: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BookForm {
  title: string;
  subtitle: string;
  authors: string;
  publisher: string;
  published_date: string;
  isbn: string;
  cover_image_url: string;
  description: string;
  table_of_contents: string;
  purchase_url: string;
  is_published: boolean;
  order_index: number;
}

// ============================================
// Book Storybook Related Types
// ============================================

export interface BookChapter {
  id: number;
  book_id: number;
  title: string;
  cover_image_url?: string | null;
  order_index: number;
  pages?: BookPage[];
  created_at: string;
  updated_at: string;
}

export interface BookPage {
  id: number;
  chapter_id: number;
  image_url: string | null;
  text_content: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface FlatPage extends BookPage {
  chapterTitle: string;
  chapterId: number;
  globalIndex: number;
  isChapterTitle: boolean;
}

export interface StorybookData {
  book: Book;
  chapters: BookChapter[];
  totalPages: number;
}

// ============================================
// Lab Related Types
// ============================================

export interface LabMember {
  id: number;
  name: string;
  name_en: string | null;
  batch: number | null;
  is_professor: boolean;
  email: string | null;
  photo_url: string | null;
  graduation_year: number | null;
  current_position: string | null;
  linkedin_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectLink {
  id?: number;
  link_type: string;
  url: string;
  title: string;
  order_index?: number;
}

export interface LabProject {
  id: number;
  batch: number;
  title: string;
  description: string | null;
  is_published: boolean;
  order_index: number;
  links: ProjectLink[];
  created_at: string;
  updated_at: string;
}

export interface LabBatchMeta {
  batch: number;
  description: string | null;
  member_count?: number;
  project_count?: number;
}

export interface MemberForm {
  name: string;
  name_en: string;
  batch: string;
  is_professor: boolean;
  email: string;
  photo_url: string;
  graduation_year: string;
  current_position: string;
  linkedin_url: string;
  is_active: boolean;
  order_index: number;
}

// ============================================
// News Related Types
// ============================================

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  is_representative: boolean;
  group_id: number | null;
  representative_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepresentativeNews {
  id: number;
  title: string;
  published_at: string;
}

export interface NewsForm {
  title: string;
  content: string;
  source: string;
  source_url: string;
  image_url: string;
  published_at: string;
  is_published: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
