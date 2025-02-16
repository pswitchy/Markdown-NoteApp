let currentNoteId = null;
let currentPage = 0;
let currentSearchTerm = '';
let simplemde;

document.addEventListener('DOMContentLoaded', function() {
    simplemde = new SimpleMDE({ element: document.getElementById('note-content') });
    listNotes(0);
});

function showLoading(button) {
    button.disabled = true;
    button.textContent = 'Saving...'; // Change button text to indicate loading
}

function hideLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText; // Restore original button text
}


function saveNoteText() {
    const title = document.getElementById('note-title').value;
    const content = simplemde.value();
    const tags = document.getElementById('note-tags').value;
    const saveButton = document.querySelector('#note-form-text button[type="submit"]'); // Select the save button
    const originalButtonText = saveButton.textContent;

    showLoading(saveButton); // Disable button and show loading state

    fetch('/notes/save-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&tags=${encodeURIComponent(tags)}`
    })
    .then(response => {
        hideLoading(saveButton, originalButtonText); // Re-enable button and restore text
        if (response.redirected) {
            window.location.href = '/login';
            return;
        }
        if (response.ok) {
            console.log('Note saved');
            listNotes(currentPage, currentSearchTerm);
            clearNoteInput();
            showSuccessMessage('Note saved successfully!'); // Show success message
        } else {
            console.error('Error saving note:', response.statusText);
            alert('Error saving note.');
        }
    });
}


function saveNoteFile() {
    const fileInput = document.getElementById('note-file');
    const title = document.getElementById('note-title').value;
    const tags = document.getElementById('note-tags').value;
    const file = fileInput.files[0];
    const saveButton = document.querySelector('#note-form-file button[type="submit"]'); // Select the save button
    const originalButtonText = saveButton.textContent;

    if (!file) {
        alert("Please select a file.");
        return;
    }

    document.getElementById('file-note-title').value = title;
    document.getElementById('file-note-tags').value = tags;

    const formData = new FormData(document.getElementById('note-form-file'));
    formData.set('title', title);
    formData.set('tags', tags);

    showLoading(saveButton); // Disable button and show loading state

    fetch('/notes/save-file', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        hideLoading(saveButton, originalButtonText); // Re-enable button and restore text
        if (response.redirected) {
            window.location.href = '/login';
            return;
        }
        if (response.ok) {
            console.log('Note saved from file');
            listNotes(currentPage, currentSearchTerm);
            clearNoteInput();
            fileInput.value = '';
            showSuccessMessage('Note saved from file successfully!'); // Show success message
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
            notesList.innerHTML = '<li class="list-group-item text-center">No notes found.</li>'; // Message when no notes
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
    listItem.className = 'list-group-item px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex justify-between items-center'; // Tailwind classes for list item and hover
    listItem.addEventListener('click', () => renderNoteHtml(note.id));

    const titleSpan = document.createElement('span');
    titleSpan.textContent = note.title;
    titleSpan.className = 'font-medium truncate'; // Tailwind class for font and truncation

    const tagsSpan = document.createElement('span');
    tagsSpan.className = 'inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none text-blue-800 bg-blue-200 rounded-full'; // Updated tag badge style
    tagsSpan.textContent = note.tags ? note.tags : 'No tags';

    listItem.appendChild(titleSpan);
    listItem.appendChild(tagsSpan);
    return listItem;
}


function updatePagination(pageData) {
    const currentPageSpan = document.getElementById('current-page');
    const prevPageItem = document.getElementById('prev-page-item');
    const nextPageItem = document.getElementById('next-page-item');

    currentPageSpan.textContent = pageData.number + 1;
    if (pageData.first) {
        prevPageItem.classList.add('disabled', 'opacity-50', 'cursor-not-allowed'); // Tailwind classes for disabled state
        prevPageItem.querySelector('button').setAttribute('disabled', true);
    } else {
        prevPageItem.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
        prevPageItem.querySelector('button').removeAttribute('disabled');
    }

    if (pageData.last) {
        nextPageItem.classList.add('disabled', 'opacity-50', 'cursor-not-allowed'); // Tailwind classes for disabled state
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
    fetch(`/notes/${noteId}/html`)
    .then(response => response.text())
    .then(htmlContent => {
        document.getElementById('note-content-html').innerHTML = `<div class="prose lg:prose-lg max-w-none">${htmlContent}</div>`; // Added prose class for better markdown rendering
    });
}

function checkGrammar() {
    if (!currentNoteId) {
        alert("Please select a note to check grammar.");
        return;
    }

    const grammarButton = document.querySelector('#grammar-check-button'); // Select the grammar check button
    const originalButtonText = grammarButton.textContent;
    showLoading(grammarButton); // Disable button and show loading state


    fetch(`/notes/${currentNoteId}/grammar-check`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(grammarResponse => {
        hideLoading(grammarButton, originalButtonText); // Re-enable button and restore text
        const grammarResultsDiv = document.getElementById('grammar-check-results');
        grammarResultsDiv.innerHTML = '';

        if (grammarResponse && grammarResponse.matches && grammarResponse.matches.length > 0) {
            let resultsHtml = "<h4 class='font-semibold mb-2'>Grammar Issues Found:</h4><ul class='list-disc pl-5'>"; // Tailwind classes for results header and list
            grammarResponse.matches.forEach(match => {
                resultsHtml += `<li><b>${match.message}</b> Suggestion: ${match.replacements.join(', ') || 'No suggestion'} (Rule: ${match.rule[0].description})</li>`;
            });
            resultsHtml += "</ul>";
            grammarResultsDiv.innerHTML = resultsHtml;
        } else {
            grammarResultsDiv.innerHTML = "<p class='text-green-500 font-medium'>No grammar issues found.</p>"; // Tailwind classes for success message
        }
    })
    .catch(error => {
        hideLoading(grammarButton, originalButtonText); // Re-enable button in case of error
        console.error("Error checking grammar:", error);
        alert("Error checking grammar. Please try again later.");
    });
}


function clearNoteInput() {
    document.getElementById('note-title').value = '';
    simplemde.value('');
    document.getElementById('note-tags').value = '';
    document.getElementById('note-file').value = '';
}

function searchNotes() {
    const searchTerm = document.getElementById('search-term').value;
    listNotes(0, searchTerm);
}

function showSuccessMessage(message) {
    const messageDiv = document.getElementById('success-message');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden'); // Make success message visible
    setTimeout(() => {
        messageDiv.classList.add('hidden'); // Hide after a delay
    }, 3000); // Hide after 3 seconds
}