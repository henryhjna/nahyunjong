import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { year, month } = await request.json();

    if (!year || !month) {
      return NextResponse.json(
        { error: '연도와 월을 지정해주세요.' },
        { status: 400 }
      );
    }

    const contentPath = '/nahyunjong-content/참고자료/언폴드스토리/scripts';

    console.log(`🚀 ${year}년 ${month}월 스토리 생성 시작...`);
    console.log('Scripts path:', contentPath);

    // Stage 1: 해당 월의 거래 데이터 생성
    console.log('[Stage 1/2] 거래 데이터 생성 중...');
    const { stdout: stdout1, stderr: stderr1 } = await execAsync(
      `cd "${contentPath}" && python3 transform_to_webapp.py`,
      { timeout: 120000 }
    );

    console.log('Stage 1 완료:', stdout1);
    if (stderr1) console.warn('Stage 1 stderr:', stderr1);

    // Stage 2: 해당 월의 스토리만 생성
    console.log(`[Stage 2/2] ${year}년 ${month}월 AI 스토리 생성 중...`);
    const { stdout: stdout2, stderr: stderr2 } = await execAsync(
      `cd "${contentPath}" && python3 generate_stories.py --year ${year} --month ${month}`,
      { timeout: 300000 } // 5분
    );

    console.log('Stage 2 완료:', stdout2);
    if (stderr2) console.warn('Stage 2 stderr:', stderr2);

    // Revalidate the story pages to show new content immediately
    revalidatePath('/education/unfold-story');
    revalidatePath(`/education/unfold-story/${year}/${String(month).padStart(2, '0')}`);

    return NextResponse.json({
      message: `${year}년 ${month}월 스토리가 생성되었습니다.`,
      details: {
        stage1: stdout1,
        stage2: stdout2,
      },
    });
  } catch (error) {
    console.error('Failed to generate story:', error);

    return NextResponse.json(
      {
        error: '스토리 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
