// Common shared types for the application

// ============================================
// Profile & About Related Types
// ============================================

export interface Education {
  id: number;
  degree: string;
  degree_en: string | null;
  field: string | null;
  field_en: string | null;
  institution: string;
  institution_en: string | null;
  year_start: number | null;
  year_end: number | null;
  description: string | null;
  description_en: string | null;
  sort_order: number;
}

export interface Career {
  id: number;
  position: string;
  position_en: string | null;
  organization: string;
  organization_en: string | null;
  year_start: number | null;
  year_end: number | null;
  is_current: boolean;
  description: string | null;
  description_en: string | null;
  sort_order: number;
}

export interface Award {
  id: number;
  title: string;
  title_en: string | null;
  organization: string | null;
  organization_en: string | null;
  year: number | null;
  description: string | null;
  description_en: string | null;
  sort_order: number;
}

export interface ProfileBasic {
  id: number;
  name: string;
  name_en: string | null;
  title: string | null;
  title_en: string | null;
  affiliation: string | null;
  affiliation_en: string | null;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  bio_en: string | null;
  tagline: string | null;
  tagline_en: string | null;
  research_interests: string[] | null;
}

export interface Profile extends ProfileBasic {
  bio_detail: string | null;
  bio_detail_en: string | null;
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
  authors_en: string | null;
  journal: string | null;
  journal_en: string | null;
  journal_tier: string | null;
  publication_type: PublicationType;
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  abstract: string | null;
  abstract_en: string | null;
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
  authors_en: string;
  journal: string;
  journal_en: string;
  journal_tier: string;
  publication_type: PublicationType;
  year: number;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  abstract: string;
  abstract_en: string;
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
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  authors: string;
  authors_en: string | null;
  publisher: string | null;
  publisher_en: string | null;
  published_date: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  description: string | null;
  description_en: string | null;
  table_of_contents: string | null;
  table_of_contents_en: string | null;
  purchase_url: string | null;
  author_note: string | null;
  author_note_en: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BookForm {
  title: string;
  title_en: string;
  subtitle: string;
  subtitle_en: string;
  authors: string;
  authors_en: string;
  publisher: string;
  publisher_en: string;
  published_date: string;
  isbn: string;
  cover_image_url: string;
  description: string;
  description_en: string;
  table_of_contents: string;
  table_of_contents_en: string;
  purchase_url: string;
  author_note: string;
  author_note_en: string;
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
  title_en: string | null;
  slug: string;
  content: string | null;
  content_en: string | null;
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
  title_en: string;
  content: string;
  content_en: string;
  source: string;
  source_url: string;
  image_url: string;
  published_at: string;
  is_published: boolean;
}

// ============================================
// Thought Related Types
// ============================================

export interface Thought {
  id: number;
  title: string;
  title_en: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string | null;
  content_en: string | null;
  category: string | null;
  category_en: string | null;
  subcategory: string | null;
  subcategory_en: string | null;
  cover_image_url: string | null;
  prev_id: number | null;
  next_id: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  prev_thought?: { slug: string; title: string; title_en: string | null } | null;
  next_thought?: { slug: string; title: string; title_en: string | null } | null;
}

export interface ThoughtForm {
  title: string;
  title_en: string;
  slug: string;
  excerpt: string;
  excerpt_en: string;
  content: string;
  content_en: string;
  category: string;
  category_en: string;
  subcategory: string;
  subcategory_en: string;
  cover_image_url: string;
  prev_id: number | null;
  next_id: number | null;
  is_published: boolean;
  published_at: string;
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
