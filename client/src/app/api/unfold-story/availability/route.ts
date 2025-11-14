import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data', 'unfold-story');

    const availability: Record<string, string[]> = {
      '2022': [],
      '2023': [],
    };

    // Check 2022
    const dir2022 = path.join(dataDir, '2022');
    try {
      const files2022 = await fs.readdir(dir2022);
      for (const file of files2022) {
        if (file.endsWith('-story.json')) {
          const content = await fs.readFile(path.join(dir2022, file), 'utf-8');
          const story = JSON.parse(content);

          // Check if it's a real story (not a template)
          if (story.scenes && story.scenes.length > 0) {
            const month = file.substring(5, 7); // Extract "03" from "2022-03-story.json"
            availability['2022'].push(month);
          }
        }
      }
    } catch (error) {
      // Directory might not exist
      console.warn('2022 directory not found');
    }

    // Check 2023
    const dir2023 = path.join(dataDir, '2023');
    try {
      const files2023 = await fs.readdir(dir2023);
      for (const file of files2023) {
        if (file.endsWith('-story.json')) {
          const content = await fs.readFile(path.join(dir2023, file), 'utf-8');
          const story = JSON.parse(content);

          // Check if it's a real story (not a template)
          if (story.scenes && story.scenes.length > 0) {
            const month = file.substring(5, 7); // Extract "03" from "2023-03-story.json"
            availability['2023'].push(month);
          }
        }
      }
    } catch (error) {
      // Directory might not exist
      console.warn('2023 directory not found');
    }

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Failed to check availability:', error);
    return NextResponse.json(
      { error: 'Failed to check story availability' },
      { status: 500 }
    );
  }
}
