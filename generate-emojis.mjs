import fs from 'fs';
import https from 'https';

function fetchGitHubEmojis() {
    return new Promise((resolve, reject) => {
        https
            .get(
                'https://api.github.com/emojis',
                { headers: { 'User-Agent': 'node.js' } },
                (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => resolve(JSON.parse(data)));
                },
            )
            .on('error', reject);
    });
}

function groupEmojisByInitialLetter(emojis) {
    const grouped = {};

    for (const [name, url] of Object.entries(emojis)) {
        const key = /^[a-zA-Z]/.test(name[0]) ? name[0].toUpperCase() : 'Số';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ name, url });
    }

    return grouped;
}

function renderGroupedEmojisToMarkdown(groups) {
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === 'Số') return -1;
        if (b === 'Số') return 1;
        return a.localeCompare(b);
    });

    let markdown = '';

    for (const key of sortedKeys) {
        const header = key === 'Số' ? 'Số' : `Ký tự ${key}`;
        markdown += `# ${header}\n`;
        markdown += `| | code | | code | | code |\n`;
        markdown += `|:--:|--|:--:|--|:--:|--|\n`;

        const items = groups[key];
        for (let i = 0; i < items.length; i += 3) {
            const row = items.slice(i, i + 3);
            const cells = row.map(({ name }) => `:${name}: | \`:${name}:\``).join(' | ');
            markdown += `| ${cells} |\n`;
        }

        markdown += '\n';
    }

    return markdown;
}

async function generateEmojiMarkdown() {
    const emojis = await fetchGitHubEmojis();
    const grouped = groupEmojisByInitialLetter(emojis);
    const markdown = renderGroupedEmojisToMarkdown(grouped);
    fs.writeFileSync('README.md', markdown);
}

generateEmojiMarkdown();
