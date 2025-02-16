let currentNoteId = null;
let currentPage = 0;
let currentSearchTerm = '';
let simplemde; // Will be initialized in index.html

document.addEventListener('DOMContentLoaded', function() {
    simplemde = new SimpleMDE({ element: document.getElementById('note-content') });
    listNotes(0); // Load initial page 0
});


function saveNoteText() {
    const title = document.getElementById('note-title').value;
    const content = simplemde.value(); // Get content from Markdown Editor
    const tags = document.getElementById('note-tags').value;

    fetch('/notes/save-text', { // Use /notes/save-text endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Form URL encoded for Thymeleaf controller
        },
        body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&tags=${encodeURIComponent(tags)}`
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = '/login'; // Handle session timeout/redirect to login
            return;
        }
        if (response.ok) {
            console.log('Note saved');
            listNotes(currentPage, currentSearchTerm); // Refresh note list, keep current page
            clearNoteInput();
        } else {
            console.error('Error saving note:', response.statusText);
            alert('Error saving note.');
        }
    });
}


function saveNoteFile() {
    const fileInput = document.getElementById('note-file');
    const title = document.getElementById('note-title').value; // Use title from text input
    const tags = document.getElementById('note-tags').value;  // Use tags from text input
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    document.getElementById('file-note-title').value = title; // Set title for file form
    document.getElementById('file-note-tags').value = tags;   // Set tags for file form

    const formData = new FormData(document.getElementById('note-form-file')); // Use form ID
    formData.set('title', title); // Ensure title is set correctly in FormData
    formData.set('tags', tags);   // Ensure tags are set correctly in FormData


    fetch('/notes/save-file', { // Use /notes/save-file endpoint
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = '/login'; // Handle session timeout/redirect to login
            return;
        }
        if (response.ok) {
            console.log('Note saved from file');
            listNotes(currentPage, currentSearchTerm); // Refresh note list, keep current page
            clearNoteInput();
            fileInput.value = ''; // Reset file input
        } else {
            console.error('Error saving note from file:', response.statusText);
            alert('Error saving note from file.');
        }
    });
}


function listNotes(page = 0, searchTerm = '') {
    currentPage = page;
    currentSearchTerm = searchTerm;
    let url = `/notes?page=${page}&size=10`; // Pagination parameters
    if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.redirected) {
            window.location.href = '/login'; // Handle session timeout/redirect to login
            return;
        }
        const notes = data.content;
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = ''; // Clear existing list
        notes.forEach(note => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.textContent = note.title;
            listItem.addEventListener('click', () => renderNoteHtml(note.id));

            const tagsSpan = document.createElement('span');
            tagsSpan.className = 'badge badge-primary badge-pill ml-2';
            tagsSpan.textContent = note.tags ? note.tags : 'No tags';
            listItem.appendChild(tagsSpan);

            notesList.appendChild(listItem);
        });

        updatePagination(data); // Update pagination controls
    });
}


function updatePagination(pageData) {
    const currentPageSpan = document.getElementById('current-page');
    const prevPageItem = document.getElementById('prev-page-item');
    const nextPageItem = document.getElementById('next-page-item');

    currentPageSpan.textContent = pageData.number + 1; // Page number is 0-indexed
    if (pageData.first) {
        prevPageItem.classList.add('disabled');
        prevPageItem.querySelector('button').setAttribute('disabled', true);
    } else {
        prevPageItem.classList.remove('disabled');
        prevPageItem.querySelector('button').removeAttribute('disabled');
    }

    if (pageData.last) {
        nextPageItem.classList.add('disabled');
        nextPageItem.querySelector('button').setAttribute('disabled', true);
    } else {
        nextPageItem.classList.remove('disabled');
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
    fetch(`/notes/${noteId}/html`)
    .then(response => response.text())
    .then(htmlContent => {
        document.getElementById('note-content-html').innerHTML = htmlContent;
    });
}

function checkGrammar() {
    if (!currentNoteId) {
        alert("Please select a note to check grammar.");
        return;
    }
    fetch(`/notes/${currentNoteId}/grammar-check`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(grammarResponse => {
        const grammarResultsDiv = document.getElementById('grammar-check-results');
        grammarResultsDiv.innerHTML = '';

        if (grammarResponse && grammarResponse.matches && grammarResponse.matches.length > 0) {
            let resultsHtml = "<h4>Grammar Issues Found:</h4><ul>";
            grammarResponse.matches.forEach(match => {
                resultsHtml += `<li><b>${match.message}</b> Suggestion: ${match.replacements.join(', ') || 'No suggestion'} (Rule: ${match.rule[0].description})</li>`;
            });
            resultsHtml += "</ul>";
            grammarResultsDiv.innerHTML = resultsHtml;
        } else {
            grammarResultsDiv.innerHTML = "<p>No grammar issues found.</p>";
        }
    })
    .catch(error => {
        console.error("Error checking grammar:", error);
        alert("Error checking grammar. Please try again later.");
    });
}


function clearNoteInput() {
    document.getElementById('note-title').value = '';
    simplemde.value(''); // Clear Markdown Editor content
    document.getElementById('note-tags').value = '';
    document.getElementById('note-file').value = '';
}

function searchNotes() {
    const searchTerm = document.getElementById('search-term').value;
    listNotes(0, searchTerm); // Reset to page 0 on new search
}