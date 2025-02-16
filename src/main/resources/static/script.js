let currentNoteId = null;
let currentPage = 0;
let currentSearchTerm = '';
let simplemde;

document.addEventListener('DOMContentLoaded', function() {
    simplemde = new SimpleMDE({
        element: document.getElementById('note-content'),
        spellChecker: false,
        toolbar: [
            "bold", "italic", "heading", "|",
            "quote", "unordered-list", "ordered-list", "|",
            "link", "image", "|",
            "preview", "side-by-side", "fullscreen", "|",
            "guide"
        ],
        placeholder: "Enter your markdown here...",
        status: false,
        autosave: {
            enabled: false
        }
    });
    listNotes(0);
    
    // Add form submission handlers
    document.getElementById('note-form-text').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNoteText();
    });
    
    document.getElementById('note-form-file').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNoteFile();
    });
});

function showLoading(button, loadingText = 'Saving...') {
    button.disabled = true;
    button.innerHTML = `<svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>${loadingText}`;
}

function hideLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
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
        hideLoading(saveButton, originalButtonText);
        if (response.redirected) {
            window.location.href = '/login';
            return;
        }
        if (response.ok) {
            console.log('Note saved');
            listNotes(currentPage, currentSearchTerm);
            clearNoteInput();
            showSuccessMessage('Note saved successfully!');
        } else {
            console.error('Error saving note:', response.statusText);
            alert('Error saving note.');
        }
    });
}

function saveNoteFile() {
    const fileInput = document.getElementById('note-file');
    const saveButton = document.querySelector('#note-form-file button[type="submit"]');
    const originalButtonText = saveButton.textContent;

    if (!fileInput.files[0]) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData(document.getElementById('note-form-file'));

    showLoading(saveButton);

    fetch('/notes/save-file', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        hideLoading(saveButton, originalButtonText);
        if (response.redirected) {
            window.location.href = '/login';
            return;
        }
        if (response.ok) {
            console.log('Note saved from file');
            listNotes(currentPage, currentSearchTerm);
            clearNoteInput();
            fileInput.value = '';
            showSuccessMessage('Note saved from file successfully!');
        } else {
            console.error('Error saving note from file:', response.statusText);
            alert('Error saving note from file.');
        }
    });
}


function listNotes(page = 0, searchTerm = '') {
    currentPage = page;
    currentSearchTerm = searchTerm;
    let url = `/notes?page=${page}&size=10`;
    if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    console.log('Fetching notes from URL:', url);

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.redirected) {
            window.location.href = '/login';
            return;
        }
        const notes = data.content;
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        if (notes.length === 0) {
            notesList.innerHTML = '<li class="list-group-item text-center py-4">No notes found.</li>';
        } else {
            notes.forEach(note => {
                const listItem = createNoteListItem(note);
                notesList.appendChild(listItem);
            });
        }
        updatePagination(data);
    });
}

function createNoteListItem(note) {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex justify-between items-center';
    listItem.addEventListener('click', () => renderNoteHtml(note.id));

    const titleSpan = document.createElement('span');
    titleSpan.textContent = note.title;
    titleSpan.className = 'font-medium truncate';

    const tagsSpan = document.createElement('span');
    tagsSpan.className = 'inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none text-blue-800 bg-blue-200 rounded-full';
    tagsSpan.textContent = note.tags ? note.tags : 'No tags';

    listItem.appendChild(titleSpan);
    listItem.appendChild(tagsSpan);
    return listItem;
}


function updatePagination(pageData) {
    const currentPageSpan = document.getElementById('current-page-number');
    const prevPageItem = document.getElementById('prev-page-item');
    const nextPageItem = document.getElementById('next-page-item');

    currentPageSpan.textContent = pageData.number + 1;
    if (pageData.first) {
        prevPageItem.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');
        prevPageItem.querySelector('button').setAttribute('disabled', true);
    } else {
        prevPageItem.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
        prevPageItem.querySelector('button').removeAttribute('disabled');
    }

    if (pageData.last) {
        nextPageItem.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');
        nextPageItem.querySelector('button').setAttribute('disabled', true);
    } else {
        nextPageItem.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
        nextPageItem.querySelector('button').removeAttribute('disabled');
    }
}

function nextPage() {
    listNotes(currentPage + 1, currentSearchTerm);
}

function prevPage() {
    listNotes(currentPage - 1, currentSearchTerm);
}


function renderNoteHtml(noteId) {
    currentNoteId = noteId;
    const noteContentHtmlDiv = document.getElementById('note-content-html');
    noteContentHtmlDiv.innerHTML = '<p class="text-gray-600 italic">Loading note content...</p>';

    console.log('Fetching HTML for note ID:', noteId);

    fetch(`/notes/${noteId}/html`)
    .then(response => response.text())
    .then(htmlContent => {
        noteContentHtmlDiv.innerHTML = `<div class="prose lg:prose-lg max-w-none">${htmlContent}</div>`;
    });
}


function checkGrammar() {
    if (!currentNoteId) {
        alert("Please select a note to check grammar.");
        return;
    }

    const grammarButton = document.querySelector('#grammar-check-button');
    const originalButtonText = grammarButton.textContent;
    showLoading(grammarButton);
    document.getElementById('grammar-placeholder').classList.remove('hidden');
    document.getElementById('grammar-results-content').classList.add('hidden');


    fetch(`/notes/${currentNoteId}/grammar-check`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(grammarResponse => {
        hideLoading(grammarButton, originalButtonText);
        const grammarResultsDiv = document.getElementById('grammar-results-content');
        const grammarPlaceholder = document.getElementById('grammar-placeholder');
        grammarResultsDiv.innerHTML = '';
        grammarPlaceholder.classList.add('hidden');
        grammarResultsDiv.classList.remove('hidden');


        if (grammarResponse && grammarResponse.matches && grammarResponse.matches.length > 0) {
            let resultsHtml = "<h4 class='font-semibold mb-3'>Grammar Issues Found:</h4><ul class='list-disc pl-5'>";
            grammarResponse.matches.forEach(match => {
                resultsHtml += `<li class="mb-2"><b>${match.message}</b> Suggestion: ${match.replacements.join(', ') || 'No suggestion'} <br> <span class="text-sm text-gray-500">Rule: ${match.rule[0].description} (${match.rule[0].category.name})</span></li>`;
            });
            resultsHtml += "</ul>";
            grammarResultsDiv.innerHTML = resultsHtml;
        } else {
            grammarResultsDiv.innerHTML = "<p class='text-green-500 font-medium'>No grammar issues found.</p>";
        }
    })
    .catch(error => {
        hideLoading(grammarButton, originalButtonText);
        console.error("Error checking grammar:", error);
        alert("Error checking grammar. Please try again later.");
    });
}


function clearNoteInput() {
    document.getElementById('note-title').value = '';
    simplemde.value('');
    document.getElementById('note-tags').value = '';
    document.getElementById('note-file').value = '';
    document.getElementById('note-title-file').value = '';
    document.getElementById('note-tags-file').value = '';
}

function searchNotes() {
    const searchTerm = document.getElementById('search-term').value;
    listNotes(0, searchTerm);
}

function showSuccessMessage(message) {
    const messageDiv = document.getElementById('success-message');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    messageDiv.classList.add('opacity-100'); // Fade in
    setTimeout(() => {
        messageDiv.classList.remove('opacity-100'); // Fade out
        messageDiv.classList.add('opacity-0', 'hidden');
    }, 3000);
}