let currentNoteId = null;
let currentPage = 0;
let currentSearchTerm = '';
let simplemde;

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

function createNoteListItem(note) {
    const listItem = document.createElement('li');
    listItem.className = 'px-6 py-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-200 last:border-b-0';
    listItem.addEventListener('click', () => renderNoteHtml(note.id));

    const content = `
        <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h3 class="text-sm font-medium text-gray-900 truncate">${note.title}</h3>
                    ${note.fromFile ? `
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            File
                        </span>
                    ` : ''}
                </div>
                <div class="mt-1 flex items-center gap-2 flex-wrap">
                    ${note.tags ? `
                        <div class="flex flex-wrap gap-1">
                            ${note.tags.split(',').map(tag => `
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    ${tag.trim()}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <span class="text-xs text-gray-500">
                        ${new Date(note.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <svg class="h-5 w-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
        </div>
    `;

    listItem.innerHTML = content;
    return listItem;
}

function listNotes(page = 0, searchTerm = '') {
    currentPage = page;
    currentSearchTerm = searchTerm;
    const notesList = document.getElementById('notes-list');
    
    // Show loading state
    notesList.innerHTML = `
        <li class="px-6 py-4 text-center">
            <div class="animate-spin inline-block h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            <p class="mt-2 text-sm text-gray-500">Loading notes...</p>
        </li>
    `;

    let url = `/notes?page=${page}&size=10`;
    if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)
        .then(response => {
            if (response.redirected) {
                window.location.href = '/login';
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }
            return response.json();
        })
        .then(data => {
            const notes = data.content;
            notesList.innerHTML = '';

            if (notes.length === 0) {
                notesList.innerHTML = `
                    <li class="px-6 py-4 text-center text-gray-500">
                        ${searchTerm ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
                    </li>
                `;
            } else {
                notes.forEach(note => {
                    const listItem = createNoteListItem(note);
                    notesList.appendChild(listItem);
                });
            }

            updatePagination(data);
        })
        .catch(error => {
            console.error('Error fetching notes:', error);
            notesList.innerHTML = `
                <li class="px-6 py-4 text-center">
                    <p class="text-red-500">Error loading notes.</p>
                    <button onclick="listNotes(${page}, '${searchTerm}')" 
                            class="mt-2 text-sm text-blue-500 hover:text-blue-700">
                        Try again
                    </button>
                </li>
            `;
        });
}

function updatePagination(pageData) {
    const currentPageNumber = document.getElementById('current-page-number');
    const prevPageItem = document.getElementById('prev-page-item');
    const nextPageItem = document.getElementById('next-page-item');

    currentPageNumber.textContent = pageData.number + 1;
    
    // Update Previous button
    const prevButton = prevPageItem.querySelector('button');
    prevButton.disabled = pageData.first;
    prevPageItem.classList.toggle('opacity-50', pageData.first);
    prevPageItem.classList.toggle('cursor-not-allowed', pageData.first);

    // Update Next button
    const nextButton = nextPageItem.querySelector('button');
    nextButton.disabled = pageData.last;
    nextPageItem.classList.toggle('opacity-50', pageData.last);
    nextPageItem.classList.toggle('cursor-not-allowed', pageData.last);
}

function saveNoteText() {
    const title = document.getElementById('note-title').value;
    const content = simplemde.value();
    const tags = document.getElementById('note-tags').value;
    const saveButton = document.querySelector('#note-form-text button[type="submit"]');
    const originalButtonText = saveButton.textContent;

    showLoading(saveButton);

    fetch('/notes/save-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&tags=${encodeURIComponent(tags)}`
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = '/login';
            return;
        }
        if (response.ok) {
            return response.json(); // Expect a JSON response from the server
        }
        throw new Error('Error saving note');
    })
    .then(data => {
        console.log('Note saved successfully:', data);
        showSuccessMessage('Note saved successfully!');
        clearNoteInput();
        // Refresh the notes list
        listNotes(0); // Reset to first page after saving
    })
    .catch(error => {
        console.error('Error saving note:', error);
        showErrorMessage('Failed to save note. Please try again.');
    })
    .finally(() => {
        hideLoading(saveButton, originalButtonText);
    });

    return false; // Prevent form submission
}

function saveNoteFile() {
    const fileInput = document.getElementById('note-file');
    const title = document.getElementById('note-title-file').value;
    const tags = document.getElementById('note-tags-file').value;
    const saveButton = document.querySelector('#note-form-file button[type="submit"]');
    const originalButtonText = saveButton.textContent;

    if (!fileInput.files[0]) {
        showErrorMessage('Please select a file.');
        return false;
    }

    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith('.md')) {
        showErrorMessage('Please select a markdown (.md) file.');
        return false;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('tags', tags);

    showLoading(saveButton);

    fetch('/notes/save-file', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = '/login';
            return;
        }
        if (!response.ok) {
            throw new Error(response.statusText || 'Error saving note');
        }
        return response.json();
    })
    .then(data => {
        console.log('Note saved from file:', data);
        showSuccessMessage('Note saved successfully!');
        clearNoteInput();
        fileInput.value = ''; // Clear the file input
        listNotes(0); // Reset to first page to show the new note
    })
    .catch(error => {
        console.error('Error saving note from file:', error);
        showErrorMessage(error.message || 'Failed to save note. Please try again.');
    })
    .finally(() => {
        hideLoading(saveButton, originalButtonText);
    });

    return false;
}

function showErrorMessage(message) {
    const messageDiv = document.getElementById('success-message');
    messageDiv.textContent = message;
    messageDiv.classList.remove('bg-green-200', 'text-green-800');
    messageDiv.classList.add('bg-red-200', 'text-red-800', 'opacity-100');
    messageDiv.classList.remove('hidden');
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize SimpleMDE with proper toolbar configuration
    simplemde = new SimpleMDE({
        element: document.getElementById('note-content'),
        spellChecker: false,
        toolbar: ["bold", "italic", "heading", "|", 
                 "quote", "code", "unordered-list", "ordered-list", "|",
                 "link", "image", "|",
                 "preview", "side-by-side", "fullscreen", "|",
                 "guide"],
        renderingConfig: {
            singleLineBreaks: false,
            codeSyntaxHighlighting: true,
        },
        status: ["lines", "words", "cursor"],
        placeholder: "Write your markdown here...",
    });
    
    // Add form submit event listeners
    document.getElementById('note-form-text').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNoteText();
    });

    document.getElementById('note-form-file').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNoteFile();
    });

    // Initial notes loading
    listNotes(0);
}); 