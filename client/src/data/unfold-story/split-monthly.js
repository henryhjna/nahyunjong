// Split yearly JSON files into monthly files
const fs = require('fs');
const path = require('path');

// Read yearly data files
const data2022 = require('./unfold-2022.json');
const data2023 = require('./unfold-2023.json');

function splitYearToMonths(yearData, year) {
  console.log(`Processing ${year}...`);

  yearData.months.forEach(monthData => {
    const monthKey = monthData.month; // e.g., "2022-03"
    const [y, m] = monthKey.split('-');

    // Create transaction file
    const transactionData = {
      month: monthData.month,
      monthLabel: monthData.monthLabel,
      transactions: monthData.transactions,
      financials: monthData.financials
    };

    const transactionFile = path.join(__dirname, year, `${monthKey}-transactions.json`);
    fs.writeFileSync(transactionFile, JSON.stringify(transactionData, null, 2), 'utf-8');
    console.log(`  ✓ Created ${transactionFile}`);

    // Create empty story file template
    const storyData = {
      month: monthData.month,
      monthLabel: monthData.monthLabel,
      title: `${parseInt(m)}월 - (제목 작성 필요)`,
      intro: `(${monthData.monthLabel} 도입부 스토리 작성 필요)`,
      scenes: [],
      quizzes: []
    };

    const storyFile = path.join(__dirname, year, `${monthKey}-story.json`);
    fs.writeFileSync(storyFile, JSON.stringify(storyData, null, 2), 'utf-8');
    console.log(`  ✓ Created ${storyFile} (template)`);
  });
}

// Split 2022 data
splitYearToMonths(data2022, '2022');

// Split 2023 data
splitYearToMonths(data2023, '2023');

console.log('\n✅ All monthly files created successfully!');
console.log('\nNext steps:');
console.log('1. Fill in story content in *-story.json files');
console.log('2. Update page.tsx to load monthly files');
console.log('3. Delete old unfold-2022.json and unfold-2023.json');
