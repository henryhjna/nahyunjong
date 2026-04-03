"""Convert production API JSON data to SQL INSERT statements."""
import json
import sys
import os

TMPDIR = os.path.join(os.environ.get('TEMP', '/tmp'), 'prod_data')

def esc(val):
    """Escape a value for SQL."""
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        items = ','.join(f'"{v}"' for v in val)
        return f"'{{{items}}}'"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def main():
    out = []
    out.append("-- Auto-generated from production API data")
    out.append("BEGIN;")
    out.append("")

    # 1. Profile
    with open(os.path.join(TMPDIR, 'profile.json'), encoding='utf-8') as f:
        p = json.load(f)

    out.append("-- Profile")
    out.append("DELETE FROM professor_awards;")
    out.append("DELETE FROM professor_career;")
    out.append("DELETE FROM professor_education;")
    out.append("DELETE FROM professor_profile;")

    ri = p.get('research_interests') or []
    out.append(f"""INSERT INTO professor_profile (id, name, name_en, title, affiliation, email, photo_url, bio, bio_detail, research_interests)
VALUES ({p['id']}, {esc(p.get('name'))}, {esc(p.get('name_en'))}, {esc(p.get('title'))}, {esc(p.get('affiliation'))}, {esc(p.get('email'))}, {esc(p.get('photo_url'))}, {esc(p.get('bio'))}, {esc(p.get('bio_detail'))}, {esc(ri)});""")

    for edu in p.get('education', []):
        out.append(f"""INSERT INTO professor_education (profile_id, degree, field, institution, institution_en, year_start, year_end, description, sort_order)
VALUES ({p['id']}, {esc(edu.get('degree'))}, {esc(edu.get('field'))}, {esc(edu.get('institution'))}, {esc(edu.get('institution_en'))}, {esc(edu.get('year_start'))}, {esc(edu.get('year_end'))}, {esc(edu.get('description'))}, {esc(edu.get('sort_order', 0))});""")

    for c in p.get('career', []):
        out.append(f"""INSERT INTO professor_career (profile_id, position, organization, organization_en, year_start, year_end, is_current, description, sort_order)
VALUES ({p['id']}, {esc(c.get('position'))}, {esc(c.get('organization'))}, {esc(c.get('organization_en'))}, {esc(c.get('year_start'))}, {esc(c.get('year_end'))}, {esc(c.get('is_current', False))}, {esc(c.get('description'))}, {esc(c.get('sort_order', 0))});""")

    for a in p.get('awards', []):
        out.append(f"""INSERT INTO professor_awards (profile_id, title, organization, year, description, sort_order)
VALUES ({p['id']}, {esc(a.get('title'))}, {esc(a.get('organization'))}, {esc(a.get('year'))}, {esc(a.get('description'))}, {esc(a.get('sort_order', 0))});""")

    out.append("")

    # 2. News
    with open(os.path.join(TMPDIR, 'news.json'), encoding='utf-8') as f:
        news_list = json.load(f)

    out.append("-- News")
    out.append("DELETE FROM news;")
    for n in news_list:
        pub = n.get('published_at', '')
        if pub:
            pub = pub[:10]  # date only
        out.append(f"""INSERT INTO news (id, title, slug, content, source, source_url, image_url, published_at, is_published, is_representative, group_id)
VALUES ({n['id']}, {esc(n.get('title'))}, {esc(n.get('slug'))}, {esc(n.get('content'))}, {esc(n.get('source'))}, {esc(n.get('source_url'))}, {esc(n.get('image_url'))}, {esc(pub)}, {esc(n.get('is_published', True))}, {esc(n.get('is_representative', True))}, {esc(n.get('group_id'))});""")

    out.append("SELECT setval('news_id_seq', (SELECT COALESCE(MAX(id),0) FROM news));")
    out.append("")

    # 3. Books
    with open(os.path.join(TMPDIR, 'books.json'), encoding='utf-8') as f:
        books = json.load(f)

    out.append("-- Books")
    out.append("DELETE FROM book_pages;")
    out.append("DELETE FROM book_chapters;")
    out.append("DELETE FROM books;")
    for b in books:
        pd = b.get('published_date', '')
        if pd:
            pd = pd[:10]
        out.append(f"""INSERT INTO books (id, title, subtitle, authors, publisher, published_date, isbn, cover_image_url, description, table_of_contents, purchase_url, is_published, order_index)
VALUES ({b['id']}, {esc(b.get('title'))}, {esc(b.get('subtitle'))}, {esc(b.get('authors'))}, {esc(b.get('publisher'))}, {esc(pd or None)}, {esc(b.get('isbn'))}, {esc(b.get('cover_image_url'))}, {esc(b.get('description'))}, {esc(b.get('table_of_contents'))}, {esc(b.get('purchase_url'))}, {esc(b.get('is_published', True))}, {esc(b.get('order_index', 0))});""")

    out.append("SELECT setval('books_id_seq', (SELECT COALESCE(MAX(id),0) FROM books));")
    out.append("")

    # 4. Publications
    with open(os.path.join(TMPDIR, 'publications.json'), encoding='utf-8') as f:
        pubs = json.load(f)

    out.append("-- Publications")
    out.append("DELETE FROM publication_categories;")
    out.append("DELETE FROM publications;")
    for pub in pubs:
        out.append(f"""INSERT INTO publications (id, title, title_en, authors, journal, journal_tier, publication_type, year, volume, issue, pages, doi, abstract, pdf_url, is_published)
VALUES ({pub['id']}, {esc(pub.get('title'))}, {esc(pub.get('title_en'))}, {esc(pub.get('authors'))}, {esc(pub.get('journal'))}, {esc(pub.get('journal_tier'))}, {esc(pub.get('publication_type', 'paper'))}, {esc(pub.get('year'))}, {esc(pub.get('volume'))}, {esc(pub.get('issue'))}, {esc(pub.get('pages'))}, {esc(pub.get('doi'))}, {esc(pub.get('abstract'))}, {esc(pub.get('pdf_url'))}, {esc(pub.get('is_published', True))});""")
        for cat in pub.get('categories', []):
            out.append(f"""INSERT INTO publication_categories (publication_id, category) VALUES ({pub['id']}, {esc(cat)});""")

    out.append("SELECT setval('publications_id_seq', (SELECT COALESCE(MAX(id),0) FROM publications));")
    out.append("")

    # 5. Lab Members
    with open(os.path.join(TMPDIR, 'members.json'), encoding='utf-8') as f:
        members = json.load(f)

    out.append("-- Lab Members")
    out.append("DELETE FROM lab_members;")
    for m in members:
        out.append(f"""INSERT INTO lab_members (id, name, name_en, batch, is_professor, email, photo_url, graduation_year, current_position, linkedin_url, is_active, order_index)
VALUES ({m['id']}, {esc(m.get('name'))}, {esc(m.get('name_en'))}, {esc(m.get('batch'))}, {esc(m.get('is_professor', False))}, {esc(m.get('email'))}, {esc(m.get('photo_url'))}, {esc(m.get('graduation_year'))}, {esc(m.get('current_position'))}, {esc(m.get('linkedin_url'))}, {esc(m.get('is_active', True))}, {esc(m.get('order_index', 0))});""")

    out.append("SELECT setval('lab_members_id_seq', (SELECT COALESCE(MAX(id),0) FROM lab_members));")
    out.append("")

    # 6. Lab Batches (projects + batch meta)
    with open(os.path.join(TMPDIR, 'batches.json'), encoding='utf-8') as f:
        batches_data = json.load(f)
        batches = batches_data.get('batches', batches_data) if isinstance(batches_data, dict) else batches_data

    out.append("-- Lab Batch Meta & Projects")
    out.append("DELETE FROM lab_project_links;")
    out.append("DELETE FROM lab_projects;")
    out.append("DELETE FROM lab_batch_meta;")
    for batch in batches:
        b_num = batch.get('batch')
        meta = batch.get('meta', {}) or {}
        if meta:
            out.append(f"""INSERT INTO lab_batch_meta (batch, hero_image_url, year, description)
VALUES ({esc(b_num)}, {esc(meta.get('hero_image_url'))}, {esc(meta.get('year'))}, {esc(meta.get('description'))})
ON CONFLICT (batch) DO UPDATE SET hero_image_url = EXCLUDED.hero_image_url, year = EXCLUDED.year, description = EXCLUDED.description;""")

        for proj in batch.get('projects', []):
            out.append(f"""INSERT INTO lab_projects (id, batch, title, description, is_published, order_index)
VALUES ({proj['id']}, {esc(b_num)}, {esc(proj.get('title'))}, {esc(proj.get('description'))}, {esc(proj.get('is_published', True))}, {esc(proj.get('order_index', 0))});""")
            for link in proj.get('links', []):
                out.append(f"""INSERT INTO lab_project_links (project_id, link_type, url, title, order_index)
VALUES ({proj['id']}, {esc(link.get('link_type'))}, {esc(link.get('url'))}, {esc(link.get('title'))}, {esc(link.get('order_index', 0))});""")

    out.append("SELECT setval('lab_projects_id_seq', (SELECT COALESCE(MAX(id),0) FROM lab_projects));")
    out.append("")

    out.append("COMMIT;")
    print('\n'.join(out))

if __name__ == '__main__':
    main()
