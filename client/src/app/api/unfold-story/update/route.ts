import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const contentPath = '/nahyunjong-content/참고자료/언폴드스토리/scripts';

    console.log('🚀 Unfold Story 업데이트 시작...');
    console.log('Scripts path:', contentPath);

    // Stage 1: Run transform_to_webapp.py (generate monthly transaction files)
    console.log('\n[Stage 1/2] 거래 데이터 생성 중...');
    const { stdout: stdout1, stderr: stderr1 } = await execAsync(
      `cd "${contentPath}" && python3 transform_to_webapp.py`,
      { timeout: 120000 } // 2 minute timeout
    );

    console.log('Stage 1 stdout:', stdout1);
    if (stderr1) {
      console.warn('Stage 1 stderr:', stderr1);
    }

    // Stage 2: Run generate_stories.py (generate story content with Claude API)
    console.log('\n[Stage 2/2] AI 스토리 생성 중...');
    const { stdout: stdout2, stderr: stderr2 } = await execAsync(
      `cd "${contentPath}" && python3 generate_stories.py --all`,
      { timeout: 600000 } // 10 minute timeout (Claude API calls take time)
    );

    console.log('Stage 2 stdout:', stdout2);
    if (stderr2) {
      console.warn('Stage 2 stderr:', stderr2);
    }

    // Revalidate all story pages to show updated content immediately
    revalidatePath('/education/unfold-story', 'layout');

    return NextResponse.json({
      message: '스토리 및 분개가 성공적으로 업데이트되었습니다.',
      details: {
        stage1: stdout1,
        stage2: stdout2,
      },
    });
  } catch (error) {
    console.error('Failed to update Unfold Story data:', error);

    return NextResponse.json(
      {
        error: '업데이트에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
