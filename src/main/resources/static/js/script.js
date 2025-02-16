async function checkGrammar() {
    const button = document.getElementById('grammar-check-button');
    const spinner = document.getElementById('grammar-check-spinner');
    const status = document.getElementById('grammar-status');
    const results = document.getElementById('grammar-check-results');
    const placeholder = document.getElementById('grammar-placeholder');
    const resultsContent = document.getElementById('grammar-results-content');
    
    // Get the currently displayed note content
    const noteContent = document.getElementById('note-content-html').innerText;
    
    if (!noteContent || noteContent.trim() === '') {
        status.textContent = 'Please select a note first';
        status.className = 'text-sm text-red-600';
        return;
    }

    try {
        // Show loading state
        button.disabled = true;
        spinner.classList.remove('hidden');
        status.textContent = 'Checking grammar...';
        status.className = 'text-sm text-blue-600';
        placeholder.classList.remove('hidden');
        resultsContent.classList.add('hidden');

        const response = await fetch(`/notes/grammar-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: noteContent })
        });

        if (!response.ok) {
            throw new Error('Grammar check failed');
        }

        const data = await response.json();
        
        // Hide placeholder and show results
        placeholder.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        
        if (data.matches && data.matches.length > 0) {
            // Format and display the grammar suggestions
            resultsContent.innerHTML = formatGrammarResults(data.matches);
            status.textContent = `Found ${data.matches.length} suggestion${data.matches.length === 1 ? '' : 's'}`;
            status.className = 'text-sm text-yellow-600';
        } else {
            resultsContent.innerHTML = '<p class="text-green-600">No grammar issues found!</p>';
            status.textContent = 'No issues found';
            status.className = 'text-sm text-green-600';
        }
    } catch (error) {
        console.error('Grammar check error:', error);
        status.textContent = 'Error checking grammar';
        status.className = 'text-sm text-red-600';
        resultsContent.innerHTML = '<p class="text-red-600">Failed to check grammar. Please try again.</p>';
    } finally {
        // Reset button state
        button.disabled = false;
        spinner.classList.add('hidden');
    }
}

function formatGrammarResults(matches) {
    return matches.map((match, index) => `
        <div class="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p class="text-yellow-800 font-medium">Suggestion ${index + 1}:</p>
            <p class="text-gray-700 mt-1">${match.message}</p>
            ${match.replacements && match.replacements.length > 0 ? `
                <p class="text-gray-600 mt-2">Suggested replacement${match.replacements.length > 1 ? 's' : ''}:</p>
                <ul class="list-disc list-inside mt-1">
                    ${match.replacements.slice(0, 3).map(r => `
                        <li class="text-blue-600">${r.value}</li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');
} 